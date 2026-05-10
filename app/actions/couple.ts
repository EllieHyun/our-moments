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
      .limit(1)
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

    // 기존 미연결 코드들 모두 삭제 (가장 최신 코드만 유지)
    console.log('기존 미연결 코드 삭제 시작:', userId)
    const { error: deleteError } = await supabase
      .from('couples')
      .delete()
      .eq('user_id_1', userId)
      .is('connected_at', null)

    if (deleteError) {
      console.error('기존 코드 삭제 실패:', deleteError)
      return { code: null, error: `기존 코드 삭제 실패: ${deleteError.message}` }
    }

    console.log('기존 코드 삭제 완료')

    const code = generateInviteCode()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간 후

    console.log('새 코드 생성 시도:', { code, expiresAt })

    const { error } = await supabase.from('couples').insert({
      user_id_1: userId,
      invite_code: code,
      invite_code_expires_at: expiresAt,
    })

    if (error) {
      console.error('DB insert 실패:', error)
      return { code: null, error: error.message }
    }

    console.log('코드 생성 성공:', code)
    return { code, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '초대 코드 생성 실패'
    console.error('createInviteCode catch 에러:', err)
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

    const cleanCode = inviteCode.trim().toUpperCase()
    console.log('초대 코드 확인 시작:', { userId, 원본: inviteCode, 정제: cleanCode })

    // 초대 코드 확인
    console.log('Supabase 쿼리 실행 중...')
    const { data: couple, error: findError } = await supabase
      .from('couples')
      .select('*')
      .eq('invite_code', cleanCode)
      .limit(1)
      .single()

    console.log('Supabase 쿼리 완료')

    console.log('초대 코드 조회 결과:', { couple, findError })

    if (findError) {
      console.error('초대 코드 조회 에러 상세:', {
        message: findError.message,
        code: findError.code,
        details: findError.details,
        hint: findError.hint,
      })
      return { error: `조회 에러: ${findError.message}` }
    }

    if (!couple) {
      console.error('조회된 데이터가 없음')
      return { error: '유효하지 않은 초대 코드입니다.' }
    }

    // 자신의 코드로 연결 시도 방지
    if (couple.user_id_1 === userId) {
      return { error: '자신의 초대 코드는 사용할 수 없습니다.' }
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
      .eq('invite_code', cleanCode)

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
