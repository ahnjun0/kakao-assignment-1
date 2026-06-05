import { useState } from 'react'
import DateHeader from './DateHeader'
import TodoInput from './TodoInput'
import FilterTabs from './FilterTabs'
import TodoList from './TodoList'
import { todayString, addDays } from '../utils/date'

/* TodoApp — 모든 상태와 핸들러의 단일 출처(single source of truth).
 *
 * [상태]
 * - todos: { id, text, done, date } 배열
 * - selectedDate: 'YYYY-MM-DD'
 * - currentFilter: 'all' | 'active' | 'done'
 *
 * [데이터 흐름] (단방향)
 * 부모 → 자식: props 로 값과 콜백을 내려준다.
 * 자식 → 부모: 콜백 호출로 변경을 요청한다 (자식이 직접 todos 를 바꾸지 않는다).
 *
 * 골격 단계라 CRUD 핸들러는 시그니처만 잡고 본문은 3단계(미션 2)에서 채운다.
 * 외곽 카드 스타일은 1차의 .app 컨테이너와 동일한 폭/여백/그림자를 쓴다. */
function TodoApp() {
  const [todos, setTodos] = useState([])
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [currentFilter, setCurrentFilter] = useState('all')

  // --- 핸들러 시그니처만 — 실제 로직은 3단계부터 ---
  function handleAdd(text) {}
  function handleToggle(id) {}
  function handleEdit(id, nextText) {}
  function handleDelete(id) {}

  function handlePrevDay() {
    setSelectedDate((current) => addDays(current, -1))
  }
  function handleNextDay() {
    setSelectedDate((current) => addDays(current, 1))
  }

  // 표시할 todos 는 selectedDate + currentFilter 로 거른 결과.
  // useEffect 가 아니라 렌더 본문에서 계산 — 파생값이므로(React 원칙 3).
  // 골격 단계라 필터링은 비워두고 그대로 넘긴다.
  const visibleTodos = todos

  return (
    <main className="min-h-screen bg-bg">
      {/* 1차 .app: max-width 520px, my-12 (48px), p-6 (24px), bg-surface, rounded-md, shadow-sm */}
      <section className="max-w-[520px] mx-auto my-12 p-6 bg-surface rounded-[10px] shadow-sm">
        {/* 헤더: 제목만 (테마 토글은 추후) */}
        <header className="flex items-center justify-between mb-4">
          <h1 className="m-0 text-2xl text-primary font-medium">Todo</h1>
        </header>

        <DateHeader
          selectedDate={selectedDate}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
        />

        <TodoInput onAdd={handleAdd} />

        <FilterTabs
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />

        <TodoList
          todos={visibleTodos}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </main>
  )
}

export default TodoApp
