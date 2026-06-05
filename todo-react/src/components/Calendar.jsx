import { useEffect, useRef, useState } from 'react'
import { addMonths, getCalendarMonthGrid } from '../utils/date'

/* Calendar — 날짜 선택 팝오버 (월별 그리드).
 * 1차 .calendar 와 동일한 룩: 월 라벨 + ‹/› + 요일 헤더 + 6주 그리드 + 점 마커.
 *
 * - selectedDate: 강조 표시할 날짜 ('YYYY-MM-DD')
 * - todayDate: 오늘 강조용
 * - todos: 날짜별 점 마커(has-todos) 표시 여부 판단용
 * - onSelectDate(dateString): 날짜 클릭 시 부모에 알리고, 동시에 팝오버를 닫는다
 * - onClose(): 외부 클릭 / Esc 키로 닫기 요청
 * - triggerRef: 팝오버를 여닫는 토글 버튼의 ref. 이 버튼 위 클릭은 "외부 클릭" 으로 보지 않는다.
 *               (그렇지 않으면 닫힘 → 토글로 다시 열림 이 동시에 일어나 절대 안 닫힌다.)
 *
 * [DOM 직접 조작 예외 사용]
 * 외부 클릭 감지는 React 의 선언적 모델로는 표현하기 어려운 명령형 동작이다.
 * 따라서 React 원칙 2 의 명시적 예외 — useRef + useEffect 로 document 리스너 등록 — 를 사용한다. */

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function Calendar({
  selectedDate,
  todayDate,
  todos,
  onSelectDate,
  onClose,
  triggerRef,
}) {
  // 표시 중인 달의 기준값. 'YYYY-MM' 문자열 (예: '2026-06').
  // 처음 열릴 때 selectedDate 가 속한 달로 시작.
  const [cursor, setCursor] = useState(() => selectedDate.slice(0, 7))

  // 외부 클릭 감지를 위한 ref. 이 컨테이너 바깥을 클릭하면 onClose 호출.
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      // 팝오버 내부 클릭은 무시.
      if (containerRef.current && containerRef.current.contains(event.target)) {
        return
      }
      // 토글 버튼 위 클릭도 무시 — 그렇지 않으면 닫힘과 토글이 동시에 일어나 다시 열린다.
      if (triggerRef && triggerRef.current && triggerRef.current.contains(event.target)) {
        return
      }
      onClose()
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, triggerRef])

  // todos 에 등록된 날짜 집합 — has-todos 마커 판단용. O(n) 한 번 모아서 O(1) lookup.
  const todoDateSet = new Set(todos.map((todo) => todo.date))

  const days = getCalendarMonthGrid(cursor)
  const [cursorYear, cursorMonth] = cursor.split('-').map(Number)
  const monthLabel = `${cursorYear}년 ${cursorMonth}월`

  function handlePrevMonth() {
    setCursor((current) => addMonths(current, -1))
  }
  function handleNextMonth() {
    setCursor((current) => addMonths(current, 1))
  }

  function handleDayClick(dateString) {
    onSelectDate(dateString)
    onClose()
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 z-10 bg-surface border border-border rounded-md shadow-md p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="이전 달"
          className="w-6 h-6 inline-flex items-center justify-center rounded-md text-muted text-sm leading-none hover:bg-primary-soft hover:text-primary"
        >
          ‹
        </button>
        <span className="font-semibold text-ink text-[13px]">{monthLabel}</span>
        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="다음 달"
          className="w-6 h-6 inline-flex items-center justify-center rounded-md text-muted text-sm leading-none hover:bg-primary-soft hover:text-primary"
        >
          ›
        </button>
      </div>

      <ul className="grid grid-cols-7 gap-0.5 list-none p-0 m-0">
        {WEEKDAY_LABELS.map((label) => (
          <li
            key={label}
            className="text-center text-[10px] text-muted py-1"
          >
            {label}
          </li>
        ))}
      </ul>

      <ul className="grid grid-cols-7 gap-0.5 list-none p-0 m-0">
        {days.map((dateString) => {
          const dayNumber = Number(dateString.split('-')[2])
          const dayMonth = dateString.slice(0, 7)
          const isOtherMonth = dayMonth !== cursor
          const isToday = dateString === todayDate
          const isSelected = dateString === selectedDate
          const hasTodos = todoDateSet.has(dateString)

          // 클래스 합성: 기본 + 강조 변형 + 다른 달 흐림.
          // - 선택: primary 배경 + 흰 글자
          // - 오늘(미선택): primary 테두리 + primary 굵은 글자 — 흰 배경에서도 명확히 보이도록
          // - 평소: 투명 배경 + 본문 색
          const base =
            'relative w-full py-1.5 text-[12px] rounded-md cursor-pointer select-none hover:bg-primary-soft border'
          const variant = isSelected
            ? 'bg-primary text-white border-primary hover:bg-primary'
            : isToday
              ? 'bg-transparent text-primary font-semibold border-primary'
              : 'bg-transparent text-ink border-transparent'
          const otherMonth = isOtherMonth ? 'opacity-45' : ''

          return (
            <li key={dateString}>
              <button
                type="button"
                onClick={() => handleDayClick(dateString)}
                className={`${base} ${variant} ${otherMonth}`}
              >
                {dayNumber}
                {hasTodos && (
                  <span
                    className={
                      'absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ' +
                      (isSelected ? 'bg-white' : 'bg-primary')
                    }
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Calendar
