'use client'

import { useState, useRef } from 'react'
import { useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import { useMap } from '@/contexts/MapContext'
import { createRecord, updateRecord } from '@/app/actions/records'
import styles from '@/styles/modals.module.css'
import formStyles from '@/styles/forms.module.css'
import type { TravelRecord } from '@/types/index'

interface KakaoPlace {
  place_name: string
  address_name: string
  road_address_name: string
  x: string
  y: string
}

interface StopState {
  id: string
  time: string
  placeTag: string
  memo: string
  lat: number | null
  lng: number | null
  photoDataUrl: string | null
  autocompleteResults: KakaoPlace[]
  showAutocomplete: boolean
}

function createEmptyStop(): StopState {
  return {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    time: '',
    placeTag: '',
    memo: '',
    lat: null,
    lng: null,
    photoDataUrl: null,
    autocompleteResults: [],
    showAutocomplete: false,
  }
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1200
        let w = img.width
        let h = img.height
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round((h * MAX) / w); w = MAX }
          else { w = Math.round((w * MAX) / h); h = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => resolve(ev.target?.result as string)
      img.src = ev.target?.result as string
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsDataURL(file)
  })
}

interface FormState {
  date: string
  title: string
  stops: StopState[]
  error: string | null
  loading: boolean
}

function buildForm(rec: TravelRecord | null): FormState {
  const today = new Date().toISOString().split('T')[0]
  return {
    date: rec?.date || today,
    title: rec?.title || '',
    stops:
      rec && rec.stops.length > 0
        ? rec.stops.map((s) => ({
            id: s.id,
            time: s.time,
            placeTag: s.placeTag,
            memo: s.memo,
            lat: s.lat,
            lng: s.lng,
            photoDataUrl: s.photoDataUrl || null,
            autocompleteResults: [],
            showAutocomplete: false,
          }))
        : [createEmptyStop()],
    error: null,
    loading: false,
  }
}

export default function RecordModal() {
  const { openModal, closeModal, editingRecord } = useUI()
  const { user } = useAuth()
  const { loadPins } = useMap()

  const [form, setForm] = useState<FormState>(() => buildForm(editingRecord))

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const { date, title, stops, error, loading } = form
  const setDate = (v: string) => setForm((f) => ({ ...f, date: v }))
  const setTitle = (v: string) => setForm((f) => ({ ...f, title: v }))
  const setStops = (fn: StopState[] | ((prev: StopState[]) => StopState[])) =>
    setForm((f) => ({
      ...f,
      stops: typeof fn === 'function' ? fn(f.stops) : fn,
    }))
  const setError = (v: string | null) => setForm((f) => ({ ...f, error: v }))
  const setLoading = (v: boolean) => setForm((f) => ({ ...f, loading: v }))

  if (openModal !== 'record') return null

  const addStop = () => setStops((prev) => [...prev, createEmptyStop()])

  const removeStop = (id: string) => setStops((prev) => prev.filter((s) => s.id !== id))

  const updateStop = (id: string, patch: Partial<StopState>) =>
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))

  const handlePlaceInput = (stopId: string, value: string) => {
    updateStop(stopId, { placeTag: value, lat: null, lng: null })

    if (debounceTimers.current[stopId]) clearTimeout(debounceTimers.current[stopId])

    if (!value.trim()) {
      updateStop(stopId, { autocompleteResults: [], showAutocomplete: false })
      return
    }

    debounceTimers.current[stopId] = setTimeout(() => {
      const kakao = (window as any).kakao
      if (!kakao?.maps?.services) return
      const ps = new kakao.maps.services.Places()
      ps.keywordSearch(value.trim(), (result: KakaoPlace[], status: string) => {
        if (status === kakao.maps.services.Status.OK) {
          updateStop(stopId, {
            autocompleteResults: result.slice(0, 6),
            showAutocomplete: true,
          })
        } else {
          updateStop(stopId, { autocompleteResults: [], showAutocomplete: false })
        }
      })
    }, 250)
  }

  const selectPlace = (stopId: string, place: KakaoPlace) => {
    updateStop(stopId, {
      placeTag: place.place_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      autocompleteResults: [],
      showAutocomplete: false,
    })
  }

  const handlePhotoChange = async (stopId: string, file: File | null) => {
    if (!file) return
    try {
      const dataUrl = await compressImage(file)
      updateStop(stopId, { photoDataUrl: dataUrl })
    } catch {
      // 무시
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { setError('사용자 정보를 찾을 수 없습니다.'); return }

    const validStops = stops.filter((s) => s.placeTag.trim())
    if (validStops.length === 0) {
      setError('장소를 하나 이상 입력해 주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const stopData = validStops.map((s) => ({
        id: s.id,
        time: s.time,
        placeTag: s.placeTag.trim(),
        memo: s.memo.trim(),
        lat: s.lat ?? 0,
        lng: s.lng ?? 0,
        photoDataUrl: s.photoDataUrl ?? undefined,
      }))

      if (editingRecord) {
        const { error: updateError } = await updateRecord(editingRecord.id, {
          date,
          title: title.trim(),
          stops: stopData,
        })
        if (updateError) { setError(updateError); return }
      } else {
        const { error: createError } = await createRecord(user.id, {
          date,
          title: title.trim(),
          stops: stopData,
          weather: undefined,
        })
        if (createError) { setError(createError); return }
      }

      await loadPins(user.id)
      closeModal()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.recordModal} onClick={closeModal}>
      <div className={styles.recordModalBackdrop} />
      <div className={styles.recordModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.recordModalHeader}>
          <h2 className={styles.recordModalTitle}>
            {editingRecord ? '기록 수정' : '새 기록'}
          </h2>
          <button className={styles.recordModalClose} onClick={closeModal} type="button">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                marginBottom: 14,
                padding: '10px 14px',
                background: 'rgba(176,64,64,0.08)',
                border: '1px solid rgba(176,64,64,0.2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                color: '#b04040',
              }}
            >
              {error}
            </div>
          )}

          <div className={formStyles.recordFormField}>
            <label className={formStyles.recordFormLabel} htmlFor="record-date">
              날짜
            </label>
            <input
              className={formStyles.recordFormInput}
              type="date"
              id="record-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={formStyles.recordFormField}>
            <label className={formStyles.recordFormLabel} htmlFor="record-title">
              오늘의 데이트
            </label>
            <input
              className={formStyles.recordFormInput}
              type="text"
              id="record-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 홍대 술 한 잔, 성수 카페 투어"
              maxLength={60}
              disabled={loading}
            />
          </div>

          <div className={formStyles.recordFormField}>
            <label className={formStyles.recordFormLabel}>방문 장소</label>
            <div className={styles.stopList}>
              {stops.map((stop) => (
                <div key={stop.id} className={styles.stopItem}>
                  <div className={styles.stopItemRow}>
                    <input
                      className={styles.stopItemTime}
                      type="time"
                      value={stop.time}
                      onChange={(e) => updateStop(stop.id, { time: e.target.value })}
                      disabled={loading}
                    />
                    <div className={styles.stopItemPlaceWrap}>
                      <input
                        className={styles.stopItemPlace}
                        type="text"
                        placeholder="장소 검색"
                        value={stop.placeTag}
                        onChange={(e) => handlePlaceInput(stop.id, e.target.value)}
                        onBlur={() =>
                          setTimeout(
                            () => updateStop(stop.id, { showAutocomplete: false }),
                            150
                          )
                        }
                        maxLength={80}
                        disabled={loading}
                        autoComplete="off"
                      />
                      {stop.showAutocomplete && stop.autocompleteResults.length > 0 && (
                        <ul className={styles.placeAutocompleteList}>
                          {stop.autocompleteResults.map((place, index) => (
                            <li
                              key={index}
                              className={styles.placeAutocompleteListItem}
                              onMouseDown={() => selectPlace(stop.id, place)}
                            >
                              <span className={styles.placeAutocompleteListName}>
                                {place.place_name}
                              </span>
                              <span className={styles.placeAutocompleteListAddress}>
                                {place.road_address_name || place.address_name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {stops.length > 1 && (
                      <button
                        type="button"
                        className={styles.stopItemRemove}
                        onClick={() => removeStop(stop.id)}
                        disabled={loading}
                        aria-label="장소 삭제"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <textarea
                    className={styles.stopItemMemo}
                    placeholder="메모 (선택)"
                    rows={2}
                    value={stop.memo}
                    onChange={(e) => updateStop(stop.id, { memo: e.target.value })}
                    disabled={loading}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label className={styles.stopItemPhotoLabel}>
                      📷 사진 추가
                      <input
                        className={styles.stopItemPhoto}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handlePhotoChange(stop.id, e.target.files?.[0] ?? null)
                        }
                        disabled={loading}
                      />
                    </label>
                    {stop.photoDataUrl && (
                      <img
                        className={styles.stopItemPhotoPreview}
                        src={stop.photoDataUrl}
                        alt="미리보기"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.btnAddStop}
              onClick={addStop}
              disabled={loading}
            >
              + 장소 추가
            </button>
          </div>

          <div className={formStyles.recordFormActions}>
            <button
              type="button"
              className={`${formStyles.recordFormBtn} ${formStyles.recordFormBtnGhost}`}
              onClick={closeModal}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className={`${formStyles.recordFormBtn} ${formStyles.recordFormBtnPrimary}`}
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
