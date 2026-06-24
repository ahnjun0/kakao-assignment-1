"use client";

/*
 * 주간 뷰 (2차 도전 미션 이식).
 *
 * 표시:
 * - 월~일 7칸. 각 칸에 요일·일자·해당 날짜의 Todo 개수.
 * - 선택된 날짜는 primary로 강조, 오늘은 별도 outline 강조.
 * - 이전 주 / 다음 주 버튼 — 선택 날짜를 ±7일 시프트해 URL `?date=`만 갱신하면
 *   부모 Server Component가 자동으로 새 주차의 카운트를 다시 받아온다.
 *
 * "use client" 이유: useSearchParams / useRouter / onClick.
 * 단방향 흐름 유지: 카운트·날짜 배열은 부모(Server)가 fetch해서 props로 내려준다.
 */

import { useRouter, useSearchParams } from "next/navigation";

import { dayOfMonth, shiftDate, weekdayShort } from "@/app/lib/dateFormat";

interface Props {
  /** 이번 주에 표시할 7개의 YYYY-MM-DD (월요일부터 일요일). */
  dates: string[];
  /** 날짜별 Todo 개수 (개수 0인 날짜는 키 없음). */
  counts: Record<string, number>;
  /** 현재 선택된 날짜 (URL ?date= 또는 오늘). */
  selectedDate: string;
  /** 서버 기준 오늘. 페이지에서 todayString()로 계산해 내려준다. */
  today: string;
}

export default function WeekView({ dates, counts, selectedDate, today }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(nextDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextDate === today) {
      params.delete("date");
    } else {
      params.set("date", nextDate);
    }
    const queryString = params.toString();
    router.push(queryString ? `/todos?${queryString}` : "/todos");
  }

  // 이전/다음 주 = 선택 날짜를 그대로 ±7일 시프트.
  // 그러면 부모가 그 날짜의 주(weekStart)를 다시 계산해 7칸을 갱신한다.
  function goPrevWeek() {
    navigate(shiftDate(selectedDate, -7));
  }
  function goNextWeek() {
    navigate(shiftDate(selectedDate, 7));
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevWeek}
          className="rounded-full px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
          aria-label="이전 주"
        >
          ‹ 이전 주
        </button>
        <span className="text-xs text-zinc-500">주간 뷰</span>
        <button
          type="button"
          onClick={goNextWeek}
          className="rounded-full px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
          aria-label="다음 주"
        >
          다음 주 ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dates.map((date) => {
          const isSelected = date === selectedDate;
          const isToday = date === today;
          const count = counts[date] ?? 0;

          // 우선순위: 선택됨(primary 배경) > 오늘(outline) > 기본.
          const buttonClass = isSelected
            ? "bg-primary text-white"
            : isToday
              ? "border border-primary text-primary"
              : "text-zinc-700 hover:bg-zinc-100";

          return (
            <button
              key={date}
              type="button"
              onClick={() => navigate(date)}
              className={`flex flex-col items-center gap-1 rounded-md py-2 text-xs transition ${buttonClass}`}
              aria-pressed={isSelected}
              aria-label={`${date} (${count}건)`}
            >
              <span className="opacity-70">{weekdayShort(date)}</span>
              <span className="text-sm font-medium">{dayOfMonth(date)}</span>
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  isSelected
                    ? "bg-white/20"
                    : count > 0
                      ? "bg-primary-soft text-primary"
                      : "text-transparent"
                }`}
              >
                {count > 0 ? count : "·"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
