import { notFound } from "next/navigation";

import { fetchTodo } from "@/app/lib/api";
import TodoForm from "../_components/TodoForm";

interface Props {
  // Next 15+부터 params는 Promise로 전달된다.
  params: Promise<{ todoId: string }>;
}

/**
 * Todo 수정 페이지.
 *
 * Server Component에서 단건 데이터를 서버 측에서 불러온 뒤,
 * 폼(TodoForm, Client)에 props로 초기값만 내려준다.
 */
export default async function EditTodoPage({ params }: Props) {
  const { todoId } = await params;
  const parsedId = Number(todoId);
  if (Number.isNaN(parsedId)) {
    notFound();
  }

  const todo = await fetchTodo(parsedId);
  if (todo === null) {
    notFound();
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Todo 수정</h1>
      <TodoForm mode="edit" todoId={todo.id} initialTitle={todo.title} />
    </section>
  );
}
