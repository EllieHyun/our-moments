'use client'

import { useState } from 'react'
import type { TravelRecord } from '@/types/index'
import styles from '@/styles/calendar.module.css'

interface CalendarViewProps {
  records: TravelRecord[]
}

export default function CalendarView({ records }: CalendarViewProps) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 해당 월의 기록 맵 생성
  const recordsByDate = new Map<string, TravelRecord[]>()
  records.forEach((record) => {
    const [y, m] = record.date.split('-')
    if (parseInt(y) === year && parseInt(m) === month + 1) {
      const dateKey = record.date
      if (!recordsByDate.has(dateKey)) {
        recordsByDate.set(dateKey, [])
      }
      recordsByDate.get(dateKey)?.push(record)
    }
  })

  // 캘린더 렌더링
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = getDaysInMonth(year, month)

  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear(year - 1)
      setMonth(11)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1)
      setMonth(0)
    } else {
      setMonth(month + 1)
    }
  }

  const selectedRecords = selectedDate ? recordsByDate.get(selectedDate) : []

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarNav}>
        <button onClick={handlePrevMonth}>←</button>
        <span className={styles.calendarMonth}>
          {year}년 {month + 1}월
        </span>
        <button onClick={handleNextMonth}>→</button>
      </div>

      <div className={styles.calendarGrid}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className={styles.calendarDayHeader}>
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <div key={index} className={styles.calendarDay}>
            {day !== null && (
              <button
                className={`${styles.calendarDayBtn} ${
                  selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? styles.calendarDayBtnSelected : ''
                } ${recordsByDate.has(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) ? styles.calendarDayBtnHasRecords : ''}`}
                onClick={() => {
                  setSelectedDate(
                    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  )
                }}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedRecords && selectedRecords.length > 0 && (
        <div className={styles.calendarDetails}>
          <h3>{selectedDate}</h3>
          <ul>
            {selectedRecords.map((record) => (
              <li key={record.id}>{record.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
