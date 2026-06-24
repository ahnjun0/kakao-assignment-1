"use server";

/**
 * Server Actions (CRUD 진입점).
 *
 * 호출 흐름: Client Component → 본 파일 함수 → FastAPI → 응답 → revalidate.
 *
 * route.ts(API Route)와의 역할 구분:
 * - actions.ts(여기): 컴포넌트에서 함수처럼 직접 import해서 호출하는 mutation 진입점.
 *   호출 후 revalidatePath로 캐시 무효화까지 책임진다.
 * - route.ts: 외부에서 HTTP로 들어오는 요청(fetch('/api/todos'))을 받아 FastAPI에 위임.
 *
 * 두 함수가 모두 BACKEND_URL을 부르지만, "어디서 호출되느냐"가 다르다.
 */

import { revalidatePath } from "next/cache";

import { BACKEND_URL } from "./lib/api";

async function callBackend(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    cache: "no-store",
    ...init,
  });
  if (!response.ok) {
    throw new Error(
      `백엔드 요청 실패 (path=${path}, status=${response.status})`,
    );
  }
  return response;
}

export async function createTodo(
  title: string,
  date?: string,
): Promise<void> {
  // date를 받으면 그날에 귀속, 안 보내면 백엔드가 서버 오늘로 채운다.
  await callBackend("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, date }),
  });
  revalidatePath("/todos");
}

export async function updateTodo(
  todoId: number,
  payload: { title?: string; completed?: boolean; date?: string },
): Promise<void> {
  await callBackend(`/todos/${todoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  revalidatePath("/todos");
  revalidatePath(`/todos/${todoId}`);
}

/** 토글은 updateTodo의 얇은 래퍼. UI 측에서 의도를 드러내려고 따로 둔다. */
export async function toggleTodo(
  todoId: number,
  completed: boolean,
): Promise<void> {
  await updateTodo(todoId, { completed });
}

export async function deleteTodo(todoId: number): Promise<void> {
  await callBackend(`/todos/${todoId}`, { method: "DELETE" });
  revalidatePath("/todos");
}
