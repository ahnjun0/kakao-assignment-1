import { getWeekDays } from '../utils/date'

/* WeekView — 월~일 7칸 그리드 + 주차 이동 + 날짜별 '완료/전체' 카운트.
 * 1차 .week-view 와 동일한 룩.
 *
 * - weekStartDate: 보이는 주의 월요일 ('YYYY-MM-DD')
 * - selectedDate: 현재 선택된 날짜 (강조용)
 * - todayDate: 오늘 날짜 (강조용, 부모가 todayString() 으로 계산해 내려준다)
 * - todos: 전체 todos (각 날짜별 카운트 계산용)
 * - onSelectDate(dateString): 칸 클릭 → 부모에 selectedDate 변경 요청
 * - onPrevWeek / onNextWeek: 주차 이동 요청
 *
 * 카운트는 렌더 본문에서 계산 — 파생값(React 원칙 3).
 * 매 칸마다 todos 를 한 번씩 훑지만 7칸이라 비용은 무시할 수 있다. */

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function WeekView({
  weekStartDate,
  selectedDate,
  todayDate,
  todos,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}) {
  const days = getWeekDays(weekStartDate)

  return (
    <div className="flex items-stretch gap-1 mb-4">
      <button
        type="button"
        onClick={onPrevWeek}
        aria-label="이전 주"
        className="w-6 border border-border bg-surface rounded-md text-muted text-sm leading-none hover:text-primary hover:border-primary"
      >
        «
      </button>

      <ul className="flex-1 grid grid-cols-7 gap-1 list-none p-0 m-0">
        {days.map((dateString, index) => {
          // 해당 날짜의 todos 집계.
          const dayTodos = todos.filter((todo) => todo.date === dateString)
          const totalCount = dayTodos.length
          const doneCount = dayTodos.filter((todo) => todo.done).length

          const isToday = dateString === todayDate
          const isSelected = dateString === selectedDate

          // 날짜의 '일' 부분만 표시 ('2026-06-05' → 5).
          const dayNumber = Number(dateString.split('-')[2])

          // 카운트 문구. 1차와 동일하게 '완료/전체' 비율로 표기.
          // 0 건이면 빈 문자열 — 자리는 min-height 로 유지해 그리드 정렬이 안 흔들리게.
          const countLabel = totalCount > 0 ? `${doneCount}/${totalCount}` : ''
          const isAllDone = totalCount > 0 && doneCount === totalCount

          // 클래스 합성 — 활성/오늘/기본을 분리해 가독성을 높인다.
          const base =
            'flex flex-col items-center justify-center py-2 border rounded-md cursor-pointer select-none transition-colors w-full'
          const variant = isSelected
            ? 'bg-primary border-primary text-white'
            : isToday
              ? 'bg-surface border-primary text-ink hover:border-primary'
              : 'bg-surface border-border text-ink hover:border-primary'

          return (
            <li key={dateString}>
              <button
                type="button"
                onClick={() => onSelectDate(dateString)}
                className={`${base} ${variant}`}
                aria-pressed={isSelected}
              >
                <span
                  className={
                    'text-[10px] ' +
                    (isSelected ? 'text-white/85' : 'text-muted')
                  }
                >
                  {WEEKDAY_LABELS[index]}
                </span>
                <span className="text-sm font-semibold mt-0.5">
                  {dayNumber}
                </span>
                <span
                  className={
                    'text-[10px] mt-0.5 min-h-3 ' +
                    (isSelected ? 'text-white/85' : 'text-muted') +
                    (isAllDone ? ' opacity-45' : '')
                  }
                >
                  {countLabel}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={onNextWeek}
        aria-label="다음 주"
        className="w-6 border border-border bg-surface rounded-md text-muted text-sm leading-none hover:text-primary hover:border-primary"
      >
        »
      </button>
    </div>
  )
}

export default WeekView
