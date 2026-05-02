/**
 * WMO 날씨 코드 맵
 * https://www.open-meteo.com/en/docs
 */
const WMO_WEATHER = {
  0: { emoji: '☀️', description: '맑음' },
  1: { emoji: '🌤️', description: '대체로 맑음' },
  2: { emoji: '⛅', description: '부분 흐림' },
  3: { emoji: '☁️', description: '흐림' },
  45: { emoji: '🌫️', description: '안개' },
  48: { emoji: '🌫️', description: '서리 안개' },
  51: { emoji: '🌧️', description: '가벼운 이슬비' },
  53: { emoji: '🌧️', description: '중간 이슬비' },
  55: { emoji: '🌧️', description: '강한 이슬비' },
  61: { emoji: '🌧️', description: '약한 비' },
  63: { emoji: '🌧️', description: '중간 비' },
  65: { emoji: '⛈️', description: '강한 비' },
  71: { emoji: '❄️', description: '약한 눈' },
  73: { emoji: '❄️', description: '중간 눈' },
  75: { emoji: '❄️', description: '강한 눈' },
  77: { emoji: '❄️', description: '눈알갱이' },
  80: { emoji: '🌧️', description: '가벼운 소나기' },
  81: { emoji: '🌧️', description: '중간 소나기' },
  82: { emoji: '⛈️', description: '강한 소나기' },
  85: { emoji: '❄️', description: '가벼운 눈소나기' },
  86: { emoji: '❄️', description: '강한 눈소나기' },
  95: { emoji: '⛈️', description: '약한 뇌우' },
  96: { emoji: '⛈️', description: '중간 뇌우' },
  99: { emoji: '⛈️', description: '강한 뇌우' },
} as const

export function getWeatherInfo(code: number) {
  return (
    WMO_WEATHER[code as keyof typeof WMO_WEATHER] || {
      emoji: '❓',
      description: '알 수 없음',
    }
  )
}

export async function fetchWeather(lat: number, lng: number, date: string) {
  try {
    // Open-Meteo Archive API
    const url = new URL('https://archive-api.open-meteo.com/v1/archive')
    url.searchParams.append('latitude', lat.toString())
    url.searchParams.append('longitude', lng.toString())
    url.searchParams.append('start_date', date)
    url.searchParams.append('end_date', date)
    url.searchParams.append('daily', 'weather_code')
    url.searchParams.append('timezone', 'auto')

    const res = await fetch(url.toString())
    const data = await res.json()

    if (data.daily && data.daily.weather_code && data.daily.weather_code.length > 0) {
      const code = data.daily.weather_code[0]
      return getWeatherInfo(code)
    }

    return null
  } catch (err) {
    console.error('날씨 조회 실패:', err)
    return null
  }
}
