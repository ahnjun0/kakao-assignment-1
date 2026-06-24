"use client";

/*
 * 필터 탭 (전체 / 진행 중 / 완료).
 *
 * 상태는 URL search params(`?filter=...`)에 저장한다. 그래야:
 * - 새로고침해도 유지
 * - 뒤로가기/공유로도 유지
 * - Server Component에서 searchParams를 받아 서버 측 필터링을 수행할 수 있다
 *
 * "use client" 이유: useSearchParams / useRouter / 클릭 이벤트가 필요하다.
 */

import { useRouter, useSearchParams } from "next/navigation";

import type { TodoFilter } from "@/app/lib/api";

const TABS: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행 중" },
  { value: "completed", label: "완료" },
];

export default function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = (searchParams.get("filter") ?? "all") as TodoFilter;

  function selectFilter(filter: TodoFilter) {
    // 기존 search params를 보존하면서 filter만 갱신한다 (도전 2의 search와 공존).
    const next = new URLSearchParams(searchParams.toString());
    if (filter === "all") {
      next.delete("filter");
    } else {
      next.set("filter", filter);
    }
    const queryString = next.toString();
    router.push(queryString ? `/todos?${queryString}` : "/todos");
  }

  return (
    <div
      role="tablist"
      aria-label="Todo 상태 필터"
      className="flex gap-1 rounded-full bg-zinc-100 p-1"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === currentFilter;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => selectFilter(tab.value)}
            className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
              isActive
                ? "bg-primary text-white"
                : "text-zinc-600 hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
