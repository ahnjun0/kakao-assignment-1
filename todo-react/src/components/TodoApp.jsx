import { useEffect, useState } from 'react'
import DateHeader from './DateHeader'
import TodoInput from './TodoInput'
import FilterTabs from './FilterTabs'
import TodoList from './TodoList'
import { todayString, addDays } from '../utils/date'

/* TodoApp — 모든 상태와 핸들러의 단일 출처(single source of truth).
 *
 * [상태]
 * - todos: { id, text, done, date } 배열 (localStorage 에 영속화)
 * - selectedDate: 'YYYY-MM-DD' (일간 뷰가 보고 있는 날짜 — 새로고침 시 오늘로 초기화)
 * - currentFilter: 'all' | 'active' | 'done' (새로고침 시 'all' 로 초기화)
 *
 * [데이터 흐름] (단방향)
 * 부모 → 자식: props 로 값과 콜백을 내려준다.
 * 자식 → 부모: 콜백 호출로 변경을 요청한다 (직접 todos 를 바꾸지 않는다).
 *
 * [영속화 전략]
 * - todos 만 저장. 화면 상태(selectedDate/currentFilter) 는 매번 초기화되는 편이 자연스럽다.
 * - 함수형 초기화 useState(() => ...) 로 마운트 시 1회만 localStorage 를 읽는다.
 * - useEffect([todos]) 로 변경 시마다 자동 저장 (외부 동기화는 effect 전용 — React 원칙 3). */

const STORAGE_KEY = 'todos'

// 저장된 todos 를 안전하게 불러온다.
// JSON 파싱 실패 / 형식이 배열이 아닌 경우 등 어떤 이상 상황에서도 빈 배열로 폴백한다.
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// --- 순수 함수: 컴포넌트 바깥에 둬서 렌더마다 재생성되지 않게 한다 ---

function getVisibleTodos(todos, selectedDate, filter) {
  const sameDate = todos.filter((todo) => todo.date === selectedDate)
  if (filter === 'active') return sameDate.filter((todo) => !todo.done)
  if (filter === 'done') return sameDate.filter((todo) => todo.done)
  return sameDate
}

const EMPTY_MESSAGE = {
  all: '이 날짜에 등록된 할 일이 없습니다.',
  active: '진행 중인 할 일이 없습니다.',
  done: '완료된 할 일이 없습니다.',
}

function TodoApp() {
  // 함수형 초기화: loadTodos() 는 마운트 시 딱 한 번만 호출된다.
  // 매 렌더마다 localStorage 를 읽는 낭비를 막기 위한 패턴.
  const [todos, setTodos] = useState(loadTodos)
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [currentFilter, setCurrentFilter] = useState('all')

  // todos 가 바뀔 때마다 localStorage 에 자동 저장.
  // 의존성 배열에 todos 가 있어야 변경이 감지된다 — 빼면 첫 마운트 때만 저장돼 무용지물.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

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
