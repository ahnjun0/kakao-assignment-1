import Link from "next/link";

import { fetchTodos } from "@/app/lib/api";
import TodoItem from "./_components/TodoItem";

/**
 * Todo 목록 페이지.
 *
 * Server Component로 두는 이유:
 * - 데이터를 단순히 불러와 렌더하기만 한다 (useState/onClick 없음).
 * - FastAPI를 서버에서 직접 호출하므로 CORS도 회피.
 * - 항목별 인터랙션(완료 토글/삭제)은 자식 TodoItem(Client)으로 위임.
 */
export default async function TodosPage() {
  const todos = await fetchTodos();

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

      {todos.length === 0 ? (
        <p className="rounded-lg bg-primary-soft px-4 py-8 text-center text-zinc-600">
          아직 Todo가 없습니다. 오른쪽 위 버튼으로 추가해보세요.
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
