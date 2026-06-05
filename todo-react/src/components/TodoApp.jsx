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
 * - selectedDate: 'YYYY-MM-DD' (일간 뷰가 보고 있는 날짜)
 * - currentFilter: 'all' | 'active' | 'done'
 *
 * [데이터 흐름] (단방향)
 * 부모(TodoApp) → 자식: props 로 값과 콜백을 내려준다.
 * 자식 → 부모: 콜백 호출로 변경을 요청한다. 자식이 직접 todos 를 바꾸지 않는다.
 *
 * [불변 업데이트 원칙]
 * setTodos 에는 항상 새 배열을 넘긴다 (todos.push 같은 mutate 금지).
 * map/filter 가 새 배열을 만들기 때문에 React 가 변경을 정확히 감지한다. */
function TodoApp() {
  const [todos, setTodos] = useState([])
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [currentFilter, setCurrentFilter] = useState('all')

  // 새 Todo 추가.
  // 빈 입력 가드는 TodoInput 에서 처리하므로 여기서는 받은 텍스트를 그대로 신뢰한다.
  // date 는 현재 선택된 날짜로 자동 주입 — 4단계(일간 뷰)에서 이 값으로 거른다.
  function handleAdd(text) {
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      done: false,
      date: selectedDate,
    }
    setTodos((current) => [...current, newTodo])
  }

  // 완료/미완료 토글. 해당 id 만 done 을 뒤집고 나머지는 그대로 둔다.
  function handleToggle(id) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }

  // 인라인 수정. 빈 문자열은 TodoItem 쪽에서 걸렀다고 가정한다.
  function handleEdit(id, nextText) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, text: nextText } : todo,
      ),
    )
  }

  // 삭제.
  function handleDelete(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  function handlePrevDay() {
    setSelectedDate((current) => addDays(current, -1))
  }
  function handleNextDay() {
    setSelectedDate((current) => addDays(current, 1))
  }

  // 표시할 todos 는 selectedDate + currentFilter 로 거른 결과.
  // useEffect 가 아니라 렌더 본문에서 계산 — 파생값이므로(React 원칙 3).
  // 골격 단계라 아직 필터링/날짜 분리는 적용하지 않고 전체를 넘긴다 (다음 단계에서 추가).
  const visibleTodos = todos

  return (
    <main className="min-h-screen bg-bg">
      <section className="max-w-[520px] mx-auto my-12 p-6 bg-surface rounded-[10px] shadow-sm">
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
