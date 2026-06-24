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

/**
 * 주의 시작일(월요일)을 YYYY-MM-DD로 반환한다.
 * JS `getDay()`는 0=일, 1=월, ..., 6=토. 월요일을 시작으로 잡기 위해
 * 일요일(0)은 -6일, 그 외 요일은 (1 - day)일 만큼 이동한다.
 */
export function startOfWeek(value: string): string {
  const d = parseLocalDate(value) ?? new Date();
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + offset);
  return formatLocalDate(start);
}

/** 시작일(weekStart, 보통 월요일)로부터 7일치 날짜를 YYYY-MM-DD 배열로. */
export function weekDates(weekStart: string): string[] {
  const start = parseLocalDate(weekStart);
  if (!start) return [];
  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return formatLocalDate(d);
  });
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

/** 주간 뷰 칸에 표시할 짧은 라벨 ("월", "화", ...). */
export function weekdayShort(value: string): string {
  const d = parseLocalDate(value);
  if (!d) return "";
  return WEEKDAY_KO[d.getDay()];
}

/** 주간 뷰 칸에 표시할 일자(day of month). */
export function dayOfMonth(value: string): number {
  const d = parseLocalDate(value);
  if (!d) return 0;
  return d.getDate();
}
