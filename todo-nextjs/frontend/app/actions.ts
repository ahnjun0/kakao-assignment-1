"use server";

/**
 * Server Actions (CRUD 진입점).
 *
 * 미션 4에서는 시그니처와 호출 흐름만 잡아 두고,
 * 실제 FastAPI 호출은 미션 5에서 채운다 (route.ts와 함께).
 *
 * route.ts(API Route, HTTP 프록시)와 차이:
 * - actions.ts는 Client/Server Component에서 함수처럼 직접 import해서 호출한다.
 * - route.ts는 외부에서 fetch('/api/todos')로 호출한다.
 *
 * 두 방식을 분리한 이유는 가이드의 학습 포인트(역할 구분)에 맞추기 위함이다.
 */

export async function createTodo(_title: string): Promise<void> {
  throw new Error("createTodo는 미션 5에서 구현됩니다.");
}

export async function updateTodo(
  _todoId: number,
  _payload: { title?: string; completed?: boolean },
): Promise<void> {
  throw new Error("updateTodo는 미션 5에서 구현됩니다.");
}

export async function toggleTodo(
  _todoId: number,
  _completed: boolean,
): Promise<void> {
  throw new Error("toggleTodo는 미션 5에서 구현됩니다.");
}

export async function deleteTodo(_todoId: number): Promise<void> {
  throw new Error("deleteTodo는 미션 5에서 구현됩니다.");
}
