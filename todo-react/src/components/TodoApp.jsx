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
 * setTodos 에는 항상 새 배열을 넘긴다 (push 같은 mutate 금지). */

// --- 순수 함수: 컴포넌트 바깥에 둬서 렌더마다 재생성되지 않게 한다 ---

// 1단계: 선택된 날짜와 같은 항목만 남긴다.
// 2단계: 현재 필터(all/active/done) 로 다시 거른다.
// 새 todos/날짜/필터가 바뀔 때마다 렌더 본문에서 다시 계산된다 (파생값).
function getVisibleTodos(todos, selectedDate, filter) {
  const sameDate = todos.filter((todo) => todo.date === selectedDate)
  if (filter === 'active') return sameDate.filter((todo) => !todo.done)
  if (filter === 'done') return sameDate.filter((todo) => todo.done)
  return sameDate
}

// 빈 상태 안내 문구.
// 전체 탭에서 비어 있으면 "이 날짜에 등록된 게 없다"는 의미이므로 날짜 기반 문구를 쓴다.
const EMPTY_MESSAGE = {
  all: '이 날짜에 등록된 할 일이 없습니다.',
  active: '진행 중인 할 일이 없습니다.',
  done: '완료된 할 일이 없습니다.',
}

function TodoApp() {
  const [todos, setTodos] = useState([])
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [currentFilter, setCurrentFilter] = useState('all')

  // 새 Todo 추가. date 는 현재 selectedDate 로 자동 주입.
  // → 다른 날짜로 이동했다가 추가하면 그 날짜에 묶인다.
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

  // 표시할 todos 는 selectedDate + currentFilter 둘 다 적용한 결과.
  const visibleTodos = getVisibleTodos(todos, selectedDate, currentFilter)
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
