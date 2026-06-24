import Link from "next/link";
import { Suspense } from "react";

import {
  fetchTodoCounts,
  fetchTodos,
  isTodoFilter,
  type TodoFilter,
} from "@/app/lib/api";
import {
  parseLocalDate,
  startOfWeek,
  todayString,
  weekDates,
} from "@/app/lib/dateFormat";
import DateHeader from "./_components/DateHeader";
import FilterTabs from "./_components/FilterTabs";
import SearchBar from "./_components/SearchBar";
import TodoItem from "./_components/TodoItem";
import WeekView from "./_components/WeekView";

interface Props {
  // Next 15+: searchParams는 Promise로 전달된다.
  searchParams: Promise<{ filter?: string; search?: string; date?: string }>;
}

/**
 * Todo 목록 페이지.
 *
 * Server Component로 두는 이유:
 * - 데이터를 단순히 불러와 렌더하기만 한다 (인터랙션 없음).
 * - FastAPI를 서버에서 직접 호출하므로 CORS도 회피.
 * - URL searchParams를 그대로 받아 서버 측 필터링·검색·날짜·주간 집계가 가능
 *   (일간 뷰 + 주간 뷰 + 도전 1·2).
 *
 * 인터랙션은 WeekView / DateHeader / FilterTabs / SearchBar / TodoItem(Client)
 * 으로 위임한다.
 */
export default async function TodosPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter: TodoFilter = isTodoFilter(params.filter) ? params.filter : "all";
  const search = params.search?.trim() ?? "";
  const today = todayString();
  const date =
    params.date && parseLocalDate(params.date) ? params.date : today;

  // 주간 뷰: 선택 날짜가 속한 주(월~일)를 계산하고, 해당 7일 범위의 카운트를
  // 서버에서 미리 받아 WeekView에 props로 내려준다.
  const weekStart = startOfWeek(date);
  const datesInWeek = weekDates(weekStart);
  // 빈 배열일 수 없지만 방어적으로 끝 인덱스를 안전하게 잡는다.
  const lastIndex = datesInWeek.length - 1;

  // Promise.all로 두 패치를 병렬화한다.
  const [todos, counts] = await Promise.all([
    fetchTodos({
      filter,
      search: search.length > 0 ? search : undefined,
      date,
    }),
    fetchTodoCounts(datesInWeek[0], datesInWeek[lastIndex]),
  ]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Todo 목록</h1>
        <Link
          href={`/todos/new?date=${date}`}
          className="rounded-full bg-primary px-4 py-2 text-sm text-white transition hover:opacity-90"
        >
          + 새 Todo
        </Link>
      </header>

      {/* useSearchParams를 쓰는 Client 컴포넌트들은 Suspense로 감싼다 (Next 15+ 권장). */}
      <Suspense fallback={<div className="h-28" />}>
        <WeekView
          dates={datesInWeek}
          counts={counts}
          selectedDate={date}
          today={today}
        />
      </Suspense>
      <Suspense fallback={<div className="h-16" />}>
        <DateHeader date={date} />
      </Suspense>
      <Suspense fallback={<div className="h-10" />}>
        <SearchBar />
      </Suspense>
      <Suspense fallback={<div className="h-10" />}>
        <FilterTabs />
      </Suspense>

      {todos.length === 0 ? (
        <p className="rounded-lg bg-primary-soft px-4 py-8 text-center text-zinc-600">
          {search
            ? `"${search}"에 해당하는 Todo가 없습니다.`
            : filter !== "all"
              ? "이 날짜에 해당 상태의 Todo가 없습니다."
              : "이 날짜에 Todo가 없습니다. 오른쪽 위 버튼으로 추가해보세요."}
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
