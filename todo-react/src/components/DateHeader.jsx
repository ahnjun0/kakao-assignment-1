import { formatKoreanDate } from '../utils/date'

/* DateHeader — 선택된 날짜 표시 + 이전/다음 이동.
 * 1차 .date-bar 와 동일한 룩.
 *
 * - selectedDate: 'YYYY-MM-DD' 문자열 (저장/연산용 포맷)
 * - onPrevDay / onNextDay: 부모에게 날짜 이동 요청
 *
 * 화면에는 사람 읽기용 한국어 포맷('YYYY년 M월 D일 (요일)') 으로 변환해 보여준다.
 * 변환은 렌더 본문에서 계산 — 단순 파생값이라 useEffect 가 아니다 (React 원칙 3).
 *
 * 달력 팝오버 / "오늘로" 버튼은 추후(도전 미션 이후) 이식 예정. */
function DateHeader({ selectedDate, onPrevDay, onNextDay }) {
  const label = formatKoreanDate(selectedDate)

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
        <span className="font-semibold text-primary">{label}</span>
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
