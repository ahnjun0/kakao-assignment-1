"use client";

/*
 * Todo 생성·수정 공용 폼.
 *
 * "use client"가 필요한 이유:
 * - 입력값을 useState로 관리하고,
 * - 폼 submit/취소 인터랙션이 있다.
 *
 * 부모(Server Component)는 mode와 초기값만 props로 내려준다.
 * 실제 Server Action 호출은 본 컴포넌트 안에서 import 후 직접 부른다.
 * (Server Component → Client로 함수 props를 직렬화 전달할 수 없기 때문.)
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { createTodo, updateTodo } from "@/app/actions";

type Mode = "create" | "edit";

interface Props {
  mode: Mode;
  todoId?: number;
  initialTitle?: string;
}

export default function TodoForm({ mode, todoId, initialTitle = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 폼 제출 후 목록으로 돌아갈 때 기존 필터/검색 상태를 유지하기 위해 보존한다.
  const queryString = searchParams.toString();
  const listHref = queryString ? `/todos?${queryString}` : "/todos";
  const [title, setTitle] = useState(initialTitle);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      setErrorMessage("내용을 입력해주세요.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createTodo(trimmed);
        } else if (mode === "edit" && todoId !== undefined) {
          await updateTodo(todoId, { title: trimmed });
        }
        // 성공 시 목록으로 돌아간다. revalidate는 Server Action 안에서 처리.
        router.push(listHref);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "요청 실패");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="todo-title" className="text-sm text-zinc-600">
        할 일
      </label>
      <input
        id="todo-title"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="예: 보고서 작성"
        className="rounded-lg border border-zinc-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
        disabled={isPending}
        autoFocus
      />
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-full bg-primary px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {mode === "create" ? "추가" : "저장"}
        </button>
        <button
          type="button"
          onClick={() => router.push(listHref)}
          disabled={isPending}
          className="rounded-full border border-zinc-200 bg-white px-4 py-3 text-zinc-600 transition hover:bg-zinc-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}
