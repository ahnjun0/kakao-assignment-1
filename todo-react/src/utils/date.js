/* 날짜 헬퍼.
 * - 모든 날짜는 'YYYY-MM-DD' 문자열로 통일한다.
 * - toISOString() 은 UTC 기준이라 한국 시간대에서 하루가 밀릴 수 있어 직접 포맷한다. */

// Date → 'YYYY-MM-DD' (로컬 시간 기준).
export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 오늘 날짜 문자열.
export function todayString() {
  return formatDate(new Date())
}

// 'YYYY-MM-DD' 문자열에 days 만큼 더한 새 문자열을 돌려준다 (음수면 과거).
export function addDays(dateString, days) {
  const [y, m, d] = dateString.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

// 'YYYY-MM-DD' → 'YYYY년 M월 D일 (요일)'
// 예: '2026-06-05' → '2026년 6월 5일 (금)'
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
export function formatKoreanDate(dateString) {
  const [y, m, d] = dateString.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${y}년 ${m}월 ${d}일 (${WEEKDAYS[date.getDay()]})`
}

// 주어진 날짜가 속한 주의 월요일을 돌려준다 (getWeekStart).
// 일요일(getDay=0) 이면 직전 월요일까지 6일을 빼고, 그 외엔 (day-1) 일 뺀다.
export function getWeekStart(dateString) {
  const [y, m, d] = dateString.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const day = date.getDay()
  const diff = day === 0 ? 6 : day - 1
  date.setDate(date.getDate() - diff)
  return formatDate(date)
}

// weekStart 부터 7일치 'YYYY-MM-DD' 배열 (월~일).
export function getWeekDays(weekStartDateString) {
  return Array.from({ length: 7 }, (_, i) =>
    addDays(weekStartDateString, i),
  )
}

// 'YYYY-MM' 문자열에 months 만큼 더한 새 'YYYY-MM' 문자열.
// Date 객체의 setMonth 가 자동으로 연도를 넘기는 동작을 이용한다.
export function addMonths(yearMonthString, months) {
  const [y, m] = yearMonthString.split('-').map(Number)
  const date = new Date(y, m - 1 + months, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// 달력 팝오버용 — 'YYYY-MM' 을 받아 6주 × 7일 = 42칸 격자를 'YYYY-MM-DD' 배열로 돌려준다.
// 월 첫날의 요일을 기준으로 이전 달 끝부분 / 현재 달 / 다음 달 시작부분을 잇는다.
// 칸 수를 42로 고정해 어느 달이든 레이아웃 높이가 일정하다.
export function getCalendarMonthGrid(yearMonthString) {
  const [y, m] = yearMonthString.split('-').map(Number)
  const firstDayOfMonth = new Date(y, m - 1, 1)
  const day = firstDayOfMonth.getDay()
  const leadingDays = day === 0 ? 6 : day - 1
  const gridStart = new Date(y, m - 1, 1 - leadingDays)

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)
    date.setDate(date.getDate() + i)
    return formatDate(date)
  })
}
