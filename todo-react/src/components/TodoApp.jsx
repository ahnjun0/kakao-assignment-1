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
 * 부모 → 자식: props 로 값과 콜백을 내려준다.
 * 자식 → 부모: 콜백 호출로 변경을 요청한다 (직접 todos 를 바꾸지 않는다).
 *
 * [불변 업데이트 원칙]
 * setTodos 에는 항상 새 배열을 넘긴다 (push 같은 mutate 금지).
 * map/filter 가 새 배열을 만들기 때문에 React 가 변경을 정확히 감지한다. */

// --- 순수 함수: 컴포넌트 바깥에 둬서 렌더마다 재생성되지 않게 한다 ---

// 현재 필터에 맞춰 todos 를 거른 새 배열을 돌려준다.
function getVisibleTodos(todos, filter) {
  if (filter === 'active') return todos.filter((todo) => !todo.done)
  if (filter === 'done') return todos.filter((todo) => todo.done)
  return todos
}

// 빈 상태에서 보여줄 안내 문구.
// 필터에 따라 다른 문구를 보여줘야 "필터 때문인지, 정말 데이터가 없는지" 가 명확해진다.
const EMPTY_MESSAGE = {
  all: '등록된 할 일이 없습니다.',
  active: '진행 중인 할 일이 없습니다.',
  done: '완료된 할 일이 없습니다.',
}

function TodoApp() {
  const [todos, setTodos] = useState([])
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [currentFilter, setCurrentFilter] = useState('all')

  // 새 Todo 추가. date 는 현재 selectedDate 로 자동 주입 (5단계에서 거를 때 사용).
  function handleAdd(text) {
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      done: false,
      date: selectedDate,
    }
    setTodos((current) => [...current, newTodo])
  }

  function handleToggle(id) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }

  function handleEdit(id, nextText) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, text: nextText } : todo,
      ),
    )
  }

  function handleDelete(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  function handlePrevDay() {
    setSelectedDate((current) => addDays(current, -1))
  }
  function handleNextDay() {
    setSelectedDate((current) => addDays(current, 1))
  }

  // 표시할 todos 는 currentFilter 로 거른 결과.
  // useEffect 가 아니라 렌더 본문에서 계산 — 파생값이므로 (React 원칙 3).
  // 일간 뷰(selectedDate 분기) 는 5단계에서 추가한다.
  const visibleTodos = getVisibleTodos(todos, currentFilter)
  const emptyMessage = EMPTY_MESSAGE[currentFilter]

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
          emptyMessage={emptyMessage}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </main>
  )
}

export default TodoApp
