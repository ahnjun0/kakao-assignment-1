/**
 * 로컬 시간대 기준 날짜 헬퍼.
 *
 * 주의: `Date.prototype.toISOString()`은 UTC로 변환해서 한국 시간(UTC+9) 새벽
 * 시간대에 하루가 밀리는 사고가 난다. 그래서 로컬 게터(getFullYear 등)로 직접 조립한다.
 */

/** YYYY-MM-DD 형태로 로컬 날짜를 포맷한다. */
export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 오늘 날짜 (로컬, YYYY-MM-DD). */
export function todayString(): string {
  return formatLocalDate(new Date());
}

/** YYYY-MM-DD 문자열을 Date로 파싱. 잘못된 형식이면 null. */
export function parseLocalDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  // 입력값이 유효한 날짜인지 역검증 (예: 2026-02-31 같은 값 거르기).
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

/** YYYY-MM-DD에서 days만큼 이동한 새 YYYY-MM-DD. */
export function shiftDate(value: string, days: number): string {
  const d = parseLocalDate(value) ?? new Date();
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

/** 화면 표시용 한국어 라벨. 예: "2026년 6월 24일 (수)". */
const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];
export function formatDisplayLabel(value: string): string {
  const d = parseLocalDate(value);
  if (!d) return value;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${
    WEEKDAY_KO[d.getDay()]
  })`;
}
