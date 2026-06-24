import Link from "next/link";
import { Suspense } from "react";

import { fetchTodos, isTodoFilter, type TodoFilter } from "@/app/lib/api";
import FilterTabs from "./_components/FilterTabs";
import TodoItem from "./_components/TodoItem";

interface Props {
  // Next 15+: searchParams는 Promise로 전달된다.
  searchParams: Promise<{ filter?: string }>;
}

/**
 * Todo 목록 페이지.
 *
 * Server Component로 두는 이유:
 * - 데이터를 단순히 불러와 렌더하기만 한다 (인터랙션 없음).
 * - FastAPI를 서버에서 직접 호출하므로 CORS도 회피.
 * - URL searchParams를 그대로 받아 서버 측 필터링이 가능 (도전 1).
 *
 * 인터랙션은 FilterTabs/TodoItem(Client)으로 위임한다.
 */
export default async function TodosPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter: TodoFilter = isTodoFilter(params.filter) ? params.filter : "all";

  const todos = await fetchTodos({ filter });

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Todo 목록</h1>
        <Link
          href="/todos/new"
          className="rounded-full bg-primary px-4 py-2 text-sm text-white transition hover:opacity-90"
        >
          + 새 Todo
        </Link>
      </header>

      {/* FilterTabs는 useSearchParams를 사용하므로 Suspense로 감싼다. */}
      <Suspense fallback={<div className="h-10" />}>
        <FilterTabs />
      </Suspense>

      {todos.length === 0 ? (
        <p className="rounded-lg bg-primary-soft px-4 py-8 text-center text-zinc-600">
          {filter === "all"
            ? "아직 Todo가 없습니다. 오른쪽 위 버튼으로 추가해보세요."
            : "해당 상태의 Todo가 없습니다."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </section>
  );
}
