/**
 * FastAPI(백엔드)와 통신할 때 공통으로 쓰는 타입과 헬퍼.
 *
 * - BACKEND_URL은 .env.local에서 읽는다 (.env.local.example 참고).
 * - fetchTodos / fetchTodo는 Server Component에서 직접 호출한다.
 *   (route.ts 프록시는 클라이언트가 HTTP로 부를 때 사용)
 */

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export type TodoFilter = "all" | "active" | "completed";

export function isTodoFilter(value: unknown): value is TodoFilter {
  return value === "all" || value === "active" || value === "completed";
}

// 서버(Node) 컨텍스트에서만 읽는 변수라 NEXT_PUBLIC_ 접두사를 붙이지 않는다.
// .env.local에 BACKEND_URL을 반드시 설정해야 한다 (.env.local.example 참고).
if (!process.env.BACKEND_URL) {
  throw new Error(
    "BACKEND_URL 환경변수가 설정되지 않았습니다. .env.local에 BACKEND_URL을 정의해주세요.",
  );
}
export const BACKEND_URL: string = process.env.BACKEND_URL;

/**
 * Todo 목록을 가져온다. cache: 'no-store'로 항상 최신 데이터.
 * filter는 도전 1, search는 도전 2, date는 일간 뷰(2차 미션 4 이식).
 * 셋 다 서버 측에서 직접 필터링한다.
 */
export async function fetchTodos(
  options: {
    filter?: TodoFilter;
    search?: string;
    date?: string;
  } = {},
): Promise<Todo[]> {
  const params = new URLSearchParams();
  if (options.filter && options.filter !== "all") {
    params.set("filter", options.filter);
  }
  if (options.search) {
    params.set("search", options.search);
  }
  if (options.date) {
    params.set("date", options.date);
  }
  const queryString = params.toString();
  const url = `${BACKEND_URL}/todos${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Todo 목록을 불러오지 못했습니다 (status: ${response.status})`);
  }
  return response.json();
}

/**
 * 주간 뷰용 날짜별 Todo 개수 (주차 시작~끝, 양 끝 포함).
 * 백엔드는 개수가 0인 날짜를 응답에 포함하지 않으므로,
 * 호출 측에서 비어 있는 날짜를 0으로 채워 7일 표시에 사용한다.
 */
export interface TodoCount {
  date: string;
  count: number;
}

export async function fetchTodoCounts(
  from: string,
  to: string,
): Promise<Record<string, number>> {
  const url = `${BACKEND_URL}/todos/counts?from=${from}&to=${to}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      `Todo 개수 집계를 불러오지 못했습니다 (status: ${response.status})`,
    );
  }
  const list: TodoCount[] = await response.json();
  return Object.fromEntries(list.map((entry) => [entry.date, entry.count]));
}

/** 단건 Todo를 가져온다. 백엔드에 단건 조회 API가 없으니 전체에서 필터링한다. */
export async function fetchTodo(todoId: number): Promise<Todo | null> {
  // 단건 조회용으로는 date 필터를 걸지 않는다 (수정 페이지가 어느 날짜든 진입 가능해야 함).
  const todos = await fetchTodos();
  return todos.find((todo) => todo.id === todoId) ?? null;
}
