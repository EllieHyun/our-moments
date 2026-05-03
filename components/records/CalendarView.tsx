'use client'

import { useState } from 'react'
import { useUI } from '@/contexts/UIContext'
import type { TravelRecord } from '@/types/index'
import styles from '@/styles/calendar.module.css'

interface CalendarViewProps {
  records: TravelRecord[]
}

export default function CalendarView({ records }: CalendarViewProps) {
  const { openPinDetail } = useUI()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const recordsByDate = new Map<string, TravelRecord[]>()
  records.forEach((record) => {
    const [y, m] = record.date.split('-')
    if (parseInt(y) === year && parseInt(m) === month + 1) {
      if (!recordsByDate.has(record.date)) recordsByDate.set(record.date, [])
      recordsByDate.get(record.date)!.push(record)
    }
  })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = new Date().toISOString().split('T')[0]

  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const handlePrevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11) }
    else setMonth(month - 1)
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0) }
    else setMonth(month + 1)
    setSelectedDate(null)
  }

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const selectedRecords = selectedDate ? (recordsByDate.get(selectedDate) ?? []) : []

  return (
    <div className={styles.memoriesCalendar}>
      <div className={styles.memoriesCalendarNav}>
        <button className={styles.memoriesCalendarNavBtn} onClick={handlePrevMonth}>‹</button>
        <span className={styles.memoriesCalendarMonthLabel}>{year}년 {month + 1}월</span>
        <button className={styles.memoriesCalendarNavBtn} onClick={handleNextMonth}>›</button>
      </div>

      <div className={styles.memoriesCalendarWeekdays}>
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div
            key={d}
            className={`${styles.memoriesCalendarWeekday} ${i === 0 ? styles.memoriesCalendarWeekdayFirst : ''} ${i === 6 ? styles.memoriesCalendarWeekdayLast : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className={styles.memoriesCalendarGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`e-${index}`} className={styles.memoriesCalendarDay} />
          }
          const ds = getDateStr(day)
          const isToday = ds === todayStr
          const hasRecords = recordsByDate.has(ds)
          const isSelected = ds === selectedDate
          const dow = (firstDay + day - 1) % 7

          const cls = [
            styles.memoriesCalendarDay,
            isSelected ? styles.memoriesCalendarDaySelected : '',
            !isSelected && hasRecords ? styles.memoriesCalendarDayHasRecords : '',
            dow === 0 ? styles.memoriesCalendarDaySun : '',
            dow === 6 ? styles.memoriesCalendarDaySat : '',
          ].filter(Boolean).join(' ')

          return (
            <div
              key={ds}
              className={cls}
              onClick={hasRecords ? () => setSelectedDate(isSelected ? null : ds) : undefined}
            >
              <span
                className={[
                  styles.memoriesCalendarDayNum,
                  isToday && !isSelected ? styles.memoriesCalendarDayTodayNum : '',
                  isSelected ? styles.memoriesCalendarDaySelectedNum : '',
                ].filter(Boolean).join(' ')}
              >
                {day}
              </span>
              {hasRecords && (
                <div
                  className={`${styles.memoriesCalendarDot} ${isSelected ? styles.memoriesCalendarDaySelectedDot : ''}`}
                />
              )}
            </div>
          )
        })}
      </div>

      {selectedRecords.length > 0 && (
        <div className={styles.memoriesCalendarRecords}>
          <div className={styles.memoriesCalendarRecordsTitle}>
            {selectedDate?.replace(/-/g, '. ')}.
          </div>
          <div className={styles.memoriesCalendarRecordsList}>
            {selectedRecords.map((record) => (
              <div
                key={record.id}
                style={{
                  cursor: 'pointer',
                  padding: '10px 12px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-soft)',
                  boxShadow: 'var(--shadow-soft)',
                }}
                onClick={() => openPinDetail(record.id)}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                  {record.title || record.stops[0]?.placeTag || '기록'}
                </div>
                {record.stops[0]?.memo && (
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {record.stops[0].memo}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
