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
      return { error: authError.message }
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
      // 프로필 저장 실패해도 인증은 성공했으므로 계속 진행
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
      return { error: error.message }
    }

    return { success: true, data }
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
