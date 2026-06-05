/* DateHeader — 선택된 날짜 표시 + 이전/다음 이동.
 * 1차 .date-bar 와 동일한 룩앤필: primary-soft 배경, 좌우 화살표는 primary 색.
 * - selectedDate: 'YYYY-MM-DD'
 * - onPrevDay / onNextDay: 부모에게 날짜 이동 요청
 *
 * 달력 팝오버 / "오늘로" 버튼은 추후(도전 미션 이후) 이식 예정. */
function DateHeader({ selectedDate, onPrevDay, onNextDay }) {
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
        <span className="font-semibold text-primary">{selectedDate}</span>
      </div>

      <button
        type="button"
        onClick={onNextDay}
        aria-label="다음 날짜"
        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-primary text-lg leading-none hover:bg-surface"
      >
        ›
      </button>
    </div>
  )
}

export default DateHeader
