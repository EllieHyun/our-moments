'use server'

import { createClient } from '@/lib/supabase/server'

export async function signUp(email: string, password: string, nickname: string) {
  const supabase = await createClient()

  try {
    // Supabase Auth에 사용자 등록
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
        },
      },
    })

    if (authError) {
      // 에러 메시지 한글화
      let errorMessage = authError.message
      if (errorMessage.includes('already registered')) {
        errorMessage = '이미 가입된 계정이 존재합니다.'
      }
      return { error: errorMessage }
    }

    if (!authData.user) {
      return { error: '사용자 생성에 실패했습니다.' }
    }

    // users 테이블에 프로필 저장 (auth.user_metadata와 동기화)
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      nickname,
      avatar_url: null,
      created_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('프로필 저장 오류:', profileError)
      return { error: `프로필 저장 실패: ${profileError.message}` }
    }

    return { success: true, data: authData.user }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    return { error: errorMessage }
  }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      let errorMessage = error.message
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 잘못되었습니다.'
      }
      return { error: errorMessage }
    }

    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single()

    if (profileError) {
      console.error('프로필 조회 오류:', profileError)
      // 프로필이 없으면 자동 생성
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user?.id,
        email: data.user?.email,
        nickname: data.user?.user_metadata?.nickname || 'User',
        avatar_url: null,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('프로필 생성 오류:', insertError)
        return { error: '프로필 생성 실패' }
      }

      // 재조회
      const { data: newProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user?.id)
        .single()

      return { success: true, data, profile: newProfile }
    }

    return { success: true, data, profile }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    return { error: errorMessage }
  }
}

export async function signOut() {
  const supabase = await createClient()

  try {
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    return { error: errorMessage }
  }
}

export async function uploadProfilePhoto(formData: FormData, userId: string) {
  const supabase = await createClient()

  try {
    const file = formData.get('file') as File
    if (!file) {
      return { error: '파일이 없습니다.' }
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `profiles/${userId}/avatar.${fileExt}`

    // 기존 파일 삭제
    await supabase.storage.from('records-photos').remove([filePath])

    // 새 파일 업로드
    const { error: uploadError } = await supabase.storage
      .from('records-photos')
      .upload(filePath, file)

    if (uploadError) {
      return { error: uploadError.message }
    }

    // 공개 URL 생성
    const { data: publicUrl } = supabase.storage
      .from('records-photos')
      .getPublicUrl(filePath)

    // users 테이블 업데이트
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl.publicUrl })
      .eq('id', userId)

    if (updateError) {
      return { error: updateError.message }
    }

    return { success: true, url: publicUrl.publicUrl }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    return { error: errorMessage }
  }
}
