'use client'

import { useState } from 'react'
import { useUI } from '@/contexts/UIContext'
import styles from '@/styles/map.module.css'

export default function MapSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const { openPinDetail } = useUI()

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (!value.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }

    // TODO: Supabase에서 검색
    // const { data } = await supabase
    //   .from('pins')
    //   .select('*')
    //   .ilike('placeTag', `%${value}%`)
    //   .limit(5)
    //
    // setResults(data || [])
    setShowDropdown(true)
  }

  const handleSelectResult = (pinId: string) => {
    openPinDetail(pinId)
    setQuery('')
    setResults([])
    setShowDropdown(false)
  }

  return (
    <div className={styles.mapSearch}>
      <input
        type="text"
        placeholder="장소 검색..."
        value={query}
        onChange={handleSearch}
        className={styles.mapSearchInput}
      />

      {showDropdown && results.length > 0 && (
        <ul className={styles.mapSearchDropdown}>
          {results.map((result: any) => (
            <li key={result.id}>
              <button onClick={() => handleSelectResult(result.id)}>
                {result.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
