"use client";

/*
 * 일간 뷰 헤더 (2차 미션 4 연속성).
 *
 * - 현재 선택된 날짜를 한국어로 표시
 * - 이전 / 오늘 / 다음 버튼으로 ±1일 이동
 * - 선택 날짜를 URL `?date=YYYY-MM-DD`에 동기화 (filter/search와 공존)
 *
 * "use client" 이유: useSearchParams / useRouter / onClick.
 */

import { useRouter, useSearchParams } from "next/navigation";

import {
  formatDisplayLabel,
  shiftDate,
  todayString,
} from "@/app/lib/dateFormat";

interface Props {
  /** 부모(Server Component)가 결정한 현재 선택 날짜. URL에 없으면 오늘. */
  date: string;
}

export default function DateHeader({ date }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = todayString();
  const isToday = date === today;

  function goTo(next: string) {
    // 기존 search params(filter/search)를 보존하면서 date만 갱신한다.
    const params = new URLSearchParams(searchParams.toString());
    if (next === today) {
      // 오늘은 기본값이므로 URL에서 빼서 공유 링크를 짧게 유지한다.
      params.delete("date");
    } else {
      params.set("date", next);
    }
    const queryString = params.toString();
    router.push(queryString ? `/todos?${queryString}` : "/todos");
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <button
        type="button"
        onClick={() => goTo(shiftDate(date, -1))}
        className="rounded-full px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
        aria-label="이전 날짜"
      >
        ←
      </button>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-zinc-900">
          {formatDisplayLabel(date)}
        </span>
        {!isToday && (
          <button
            type="button"
            onClick={() => goTo(today)}
            className="text-xs text-primary hover:underline"
          >
            오늘로 이동
          </button>
        )}
        {isToday && (
          <span className="text-xs text-primary">오늘</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => goTo(shiftDate(date, 1))}
        className="rounded-full px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
        aria-label="다음 날짜"
      >
        →
      </button>
    </div>
  );
}
