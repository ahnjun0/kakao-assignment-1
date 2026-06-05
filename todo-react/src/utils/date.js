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

// 'YYYY-MM-DD' 문자열에 days 만큼 더한 새 문자열을 돌려준다.
// 음수면 과거로 이동.
export function addDays(dateString, days) {
  const [y, m, d] = dateString.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

// 'YYYY-MM-DD' → 'YYYY년 M월 D일 (요일)' 형태의 사람 읽기용 문자열.
// 예: '2026-06-05' → '2026년 6월 5일 (금)'
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
export function formatKoreanDate(dateString) {
  const [y, m, d] = dateString.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = WEEKDAYS[date.getDay()]
  return `${y}년 ${m}월 ${d}일 (${weekday})`
}
