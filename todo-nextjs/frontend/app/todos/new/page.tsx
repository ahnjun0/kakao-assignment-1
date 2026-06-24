import TodoForm from "../_components/TodoForm";

/**
 * 새 Todo 생성 페이지.
 *
 * 페이지 자체는 Server Component로 두고(데이터 fetch 없음),
 * 인터랙션이 필요한 폼(TodoForm)만 Client로 분리한다.
 */
export default function NewTodoPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">새 Todo</h1>
      <TodoForm mode="create" />
    </section>
  );
}
