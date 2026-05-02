'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * 간단한 초대 코드 생성 (uuid 대신 사용)
 */
function generateInviteCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'COUPLE-'
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code
}

/**
 * 파트너 정보 조회
 */
export async function getPartnerInfo(userId: string) {
  try {
    const supabase = await createClient()

    // 커플 연결 확인
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select('*')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .single()

    if (coupleError || !couple) {
      return { partner: null, connected: false }
    }

    const partnerId = couple.user_id_1 === userId ? couple.user_id_2 : couple.user_id_1

    // 파트너 정보 조회
    const { data: partner } = await supabase
      .from('users')
      .select('*')
      .eq('id', partnerId)
      .single()

    return { partner, connected: !!couple.connected_at }
  } catch (err) {
    console.error('파트너 정보 조회 실패:', err)
    return { partner: null, connected: false }
  }
}

/**
 * 초대 코드 생성
 */
export async function createInviteCode(
  userId: string
): Promise<{ code: string | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const code = generateInviteCode()

    const { error } = await supabase.from('couples').insert({
      user_id_1: userId,
      invite_code: code,
    })

    if (error) {
      return { code: null, error: error.message }
    }

    return { code, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '초대 코드 생성 실패'
    return { code: null, error: errorMessage }
  }
}

/**
 * 초대 코드로 커플 연결
 */
export async function connectCouple(
  userId: string,
  inviteCode: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    // 초대 코드 확인
    const { data: couple, error: findError } = await supabase
      .from('couples')
      .select('*')
      .eq('invite_code', inviteCode)
      .single()

    if (findError || !couple) {
      return { error: '유효하지 않은 초대 코드입니다.' }
    }

    if (couple.user_id_2) {
      return { error: '이미 연결된 초대 코드입니다.' }
    }

    // 커플 연결
    const { error: updateError } = await supabase
      .from('couples')
      .update({
        user_id_2: userId,
        connected_at: new Date().toISOString(),
      })
      .eq('invite_code', inviteCode)

    if (updateError) {
      return { error: updateError.message }
    }

    return { error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '커플 연결 실패'
    return { error: errorMessage }
  }
}

/**
 * 커플 연결 해제
 */
export async function disconnectCouple(userId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('couples')
      .delete()
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '커플 연결 해제 실패'
    return { error: errorMessage }
  }
}
