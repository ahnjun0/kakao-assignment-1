"use client";

/*
 * 검색창 (도전 2).
 *
 * 입력값을 그대로 URL ?search= 에 동기화한다. 다만 키 입력마다 라우팅을 갈면
 * 백엔드 호출이 과도해지므로 **디바운스(300ms)** 를 둔다.
 *
 * - 입력값은 로컬 useState로 즉시 반영 (UI 반응성)
 * - 일정 시간 입력이 멈춘 뒤에만 router.replace로 URL 갱신 → Server Component 재렌더
 * - filter 등 다른 search params는 보존
 *
 * "use client" 이유: useState/useEffect/useSearchParams/useRouter 사용.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const DEBOUNCE_MS = 300;

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";

  // 입력값은 별도 state로 관리해 즉시 UI에 반영.
  const [value, setValue] = useState(currentSearch);

  // 입력이 멈춘 뒤에만 URL을 갱신한다.
  useEffect(() => {
    // URL과 같은 값이면 굳이 갱신하지 않는다 (불필요한 라우팅 방지).
    if (value === currentSearch) {
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (value.trim().length === 0) {
        next.delete("search");
      } else {
        next.set("search", value.trim());
      }
      const queryString = next.toString();
      router.replace(queryString ? `/todos?${queryString}` : "/todos");
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, currentSearch, router, searchParams]);

  return (
    <input
      type="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Todo 내용 검색"
      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none"
      aria-label="Todo 검색"
    />
  );
}
