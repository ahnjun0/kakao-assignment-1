/**
 * FastAPI(백엔드)와 통신할 때 공통으로 쓰는 타입과 헬퍼.
 *
 * - BACKEND_URL은 미션 6에서 .env.local의 BACKEND_URL로 교체된다.
 *   .env.local이 없을 때를 대비해 fallback을 둔다.
 * - fetchTodos / fetchTodo는 Server Component에서 직접 호출한다.
 *   (route.ts 프록시는 클라이언트가 HTTP로 부를 때 사용)
 */

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

// 서버(Node) 컨텍스트에서만 읽는 변수라 NEXT_PUBLIC_ 접두사를 붙이지 않는다.
// .env.local에 BACKEND_URL을 반드시 설정해야 한다 (.env.local.example 참고).
if (!process.env.BACKEND_URL) {
  throw new Error(
    "BACKEND_URL 환경변수가 설정되지 않았습니다. .env.local에 BACKEND_URL을 정의해주세요.",
  );
}
export const BACKEND_URL: string = process.env.BACKEND_URL;

/** 전체 Todo 목록을 가져온다. cache: 'no-store'로 항상 최신 데이터. */
export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(`${BACKEND_URL}/todos`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Todo 목록을 불러오지 못했습니다 (status: ${response.status})`);
  }
  return response.json();
}

/** 단건 Todo를 가져온다. 백엔드에 단건 조회 API가 없으니 목록에서 필터링한다. */
export async function fetchTodo(todoId: number): Promise<Todo | null> {
  const todos = await fetchTodos();
  return todos.find((todo) => todo.id === todoId) ?? null;
}
