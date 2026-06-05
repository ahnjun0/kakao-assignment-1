import { useRef, useState } from 'react'
import Calendar from './Calendar'
import { formatKoreanDate } from '../utils/date'

/* DateHeader — 선택된 날짜 표시 + 이전/다음 이동 + "오늘로" 버튼 + 달력 팝오버 토글.
 * 1차 .date-bar 와 동일한 룩.
 *
 * - selectedDate / todayDate: 표시 + "오늘로" 버튼 노출 결정
 * - todos: 달력 팝오버에 점 마커용으로 그대로 전달
 * - onPrevDay / onNextDay / onGoToday / onSelectDate: 부모에게 변경 요청
 *
 * [팝오버 열림 상태(isCalendarOpen)]
 * 이 컴포넌트만 쓰는 UI 상태라 로컬 useState 로 둔다 (state co-location).
 *
 * [toggleButtonRef 의 역할]
 * 팝오버를 여닫는 버튼 자체 위 클릭은 Calendar 의 외부 클릭 감지가 무시해야 한다.
 * 그렇지 않으면 mousedown 단계에서 "외부 클릭 → 닫기" 와 click 단계의 "토글 → 다시 열기" 가
 * 함께 일어나 절대 닫히지 않는다. ref 를 Calendar 에 prop 으로 넘겨 예외 처리한다. */
function DateHeader({
  selectedDate,
  todayDate,
  todos,
  onPrevDay,
  onNextDay,
  onGoToday,
  onSelectDate,
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const toggleButtonRef = useRef(null)

  const label = formatKoreanDate(selectedDate)
  const isToday = selectedDate === todayDate

  function toggleCalendar() {
    setIsCalendarOpen((open) => !open)
  }
  function closeCalendar() {
    setIsCalendarOpen(false)
  }

  return (
    <div className="relative flex items-center justify-between mb-2 px-3 py-2 bg-primary-soft rounded-md">
      <button
        type="button"
        onClick={onPrevDay}
        aria-label="이전 날짜"
        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-primary text-lg leading-none hover:bg-surface"
      >
        ‹
      </button>

      <div className="flex items-center gap-2">
        {/* "오늘로" 버튼: 오늘이 아닐 때만 보인다. */}
        {!isToday && (
          <button
            type="button"
            onClick={onGoToday}
            className="border border-primary bg-surface text-primary text-[11px] font-semibold py-0.5 px-2 rounded-full hover:bg-primary hover:text-white"
          >
            오늘로
          </button>
        )}

        {/* 라벨 자체가 토글 버튼. 충분히 큰 폰트 + 패딩 + hover 배경으로
            "여기 클릭하면 달력이 열린다" 라는 시각 단서를 강하게 준다. */}
        <button
          ref={toggleButtonRef}
          type="button"
          onClick={toggleCalendar}
          aria-expanded={isCalendarOpen}
          aria-haspopup="dialog"
          className="inline-flex items-center gap-2 bg-transparent border-0 text-primary font-semibold text-lg px-3 py-1.5 rounded-md cursor-pointer hover:bg-surface"
        >
          <span>{label}</span>
          <span
            className={
              'text-base leading-none transition-transform ' +
              (isCalendarOpen ? 'rotate-180' : '')
            }
            aria-hidden="true"
          >
            ▾
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={onNextDay}
        aria-label="다음 날짜"
        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-primary text-lg leading-none hover:bg-surface"
      >
        ›
      </button>

      {isCalendarOpen && (
        <Calendar
          selectedDate={selectedDate}
          todayDate={todayDate}
          todos={todos}
          onSelectDate={onSelectDate}
          onClose={closeCalendar}
          triggerRef={toggleButtonRef}
        />
      )}
    </div>
  )
}

export default DateHeader
