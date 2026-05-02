'use server'

import { createClient } from '@/lib/supabase/server'
import type { TravelRecord } from '@/types/index'

/**
 * 새 기록(여행) 생성
 */
export async function createRecord(
  userId: string,
  data: Omit<TravelRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: TravelRecord | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data: record, error } = await supabase
      .from('records')
      .insert({
        user_id: userId,
        couple_id: data.couple_id,
        date: data.date,
        title: data.title,
        stops: data.stops,
        weather: data.weather,
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: record, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '기록 생성 실패'
    return { data: null, error: errorMessage }
  }
}

/**
 * 기록 수정
 */
export async function updateRecord(
  recordId: string,
  data: Partial<TravelRecord>
): Promise<{ data: TravelRecord | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data: record, error } = await supabase
      .from('records')
      .update({
        title: data.title,
        date: data.date,
        stops: data.stops,
        weather: data.weather,
      })
      .eq('id', recordId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: record, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '기록 수정 실패'
    return { data: null, error: errorMessage }
  }
}

/**
 * 기록 삭제
 */
export async function deleteRecord(recordId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('records').delete().eq('id', recordId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '기록 삭제 실패'
    return { error: errorMessage }
  }
}

/**
 * 사용자의 모든 기록 조회
 */
export async function getRecords(userId: string): Promise<{
  data: TravelRecord[]
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data: records, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: records || [], error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '기록 조회 실패'
    return { data: [], error: errorMessage }
  }
}
