"use client";

/*
 * "use client"가 붙은 이유:
 * - 완료 토글/삭제 버튼에 onClick이 달려야 하고,
 * - 요청 중 상태를 useState로 표시할 예정이다.
 *
 * 미션 4 단계에서는 actions.ts가 stub이라 실제 동작은 미션 5에서 채운다.
 * 단, 컴포넌트 구조와 props 타입은 미리 잡아 둔다.
 */

import Link from "next/link";
import { useState, useTransition } from "react";

import { toggleTodo, deleteTodo } from "@/app/actions";
import type { Todo } from "@/app/lib/api";

interface Props {
  todo: Todo;
}

export default function TodoItem({ todo }: Props) {
  // useTransition: Server Action 호출 중 pending 상태 표시.
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleToggle() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await toggleTodo(todo.id, !todo.completed);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "토글 실패");
      }
    });
  }

  function handleDelete() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await deleteTodo(todo.id);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "삭제 실패");
      }
    });
  }

  return (
    <li className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={isPending}
          className="h-4 w-4 accent-primary"
          aria-label={`${todo.title} 완료 토글`}
        />
        <span
          className={`flex-1 ${
            todo.completed ? "text-zinc-400 line-through" : "text-zinc-900"
          }`}
        >
          {todo.title}
        </span>
        <Link
          href={`/todos/${todo.id}`}
          className="text-sm text-primary hover:underline"
        >
          수정
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm text-red-500 hover:underline disabled:opacity-50"
        >
          삭제
        </button>
      </div>
      {errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </li>
  );
}
