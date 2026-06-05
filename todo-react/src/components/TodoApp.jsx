import { useEffect, useState } from 'react'
import DateHeader from './DateHeader'
import WeekView from './WeekView'
import TodoInput from './TodoInput'
import FilterTabs from './FilterTabs'
import TodoList from './TodoList'
import { todayString, addDays, getWeekStart } from '../utils/date'

/* TodoApp — 모든 상태와 핸들러의 단일 출처(single source of truth).
 *
 * [상태]
 * - todos: { id, text, done, date } 배열 (localStorage 영속화)
 * - selectedDate: 'YYYY-MM-DD' (일간 뷰가 보고 있는 날짜)
 * - currentFilter: 'all' | 'active' | 'done'
 * - weekStartDate: 'YYYY-MM-DD' (주간 뷰의 월요일, localStorage 영속화)
 *
 * [데이터 흐름] (단방향)
 * 부모 → 자식: props 로 값과 콜백을 내려준다.
 * 자식 → 부모: 콜백 호출로 변경을 요청한다 (직접 todos 를 바꾸지 않는다).
 *
 * [selectedDate ↔ weekStartDate 관계]
 * 두 값은 독립 state. 사용자는 주차만 미리보고 싶을 수 있다 (selectedDate 는 유지한 채로).
 * 단, 일간 ◀/▶ 으로 selectedDate 가 현재 주 범위를 벗어나면
 * 주간 뷰가 자동으로 따라간다 (UX 일관성). 이건 effect 가 아니라 핸들러에서 즉시 처리. */

const STORAGE_KEY_TODOS = 'todos'
const STORAGE_KEY_WEEK = 'weekStartDate'

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TODOS)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// 저장된 weekStartDate 를 안전하게 불러온다. 형식이 'YYYY-MM-DD' 가 아니면 폴백.
function loadWeekStart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WEEK)
    if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) return saved
  } catch {}
  return getWeekStart(todayString())
}

// --- 순수 함수 ---

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
  const [todos, setTodos] = useState(loadTodos)
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [currentFilter, setCurrentFilter] = useState('all')
  const [weekStartDate, setWeekStartDate] = useState(loadWeekStart)

  // 오늘 날짜는 컴포넌트가 살아있는 동안 고정으로 본다 (자정 넘김 처리는 범위 밖).
  const todayDate = todayString()

  // 영속화: todos / weekStartDate 가 바뀔 때마다 자동 저장.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WEEK, weekStartDate)
  }, [weekStartDate])

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

  // selectedDate 가 weekStartDate ~ weekStartDate+6 범위 안인지 확인.
  // 문자열 'YYYY-MM-DD' 는 사전식 비교가 곧 날짜 비교라 < > 가 그대로 동작한다.
  function ensureWeekContains(dateString) {
    const weekEnd = addDays(weekStartDate, 6)
    if (dateString < weekStartDate || dateString > weekEnd) {
      setWeekStartDate(getWeekStart(dateString))
    }
  }

  // 일간 ◀/▶: selectedDate 이동 + 필요시 주간 뷰 따라가기.
  function handlePrevDay() {
    const next = addDays(selectedDate, -1)
    setSelectedDate(next)
    ensureWeekContains(next)
  }
  function handleNextDay() {
    const next = addDays(selectedDate, 1)
    setSelectedDate(next)
    ensureWeekContains(next)
  }

  // 주간 ◀/▶: 주만 이동, selectedDate 는 그대로.
  function handlePrevWeek() {
    setWeekStartDate((current) => addDays(current, -7))
  }
  function handleNextWeek() {
    setWeekStartDate((current) => addDays(current, 7))
  }

  // WeekView 칸 클릭 → selectedDate 만 변경 (주는 그대로).
  function handleSelectDate(dateString) {
    setSelectedDate(dateString)
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

        <WeekView
          weekStartDate={weekStartDate}
          selectedDate={selectedDate}
          todayDate={todayDate}
          todos={todos}
          onSelectDate={handleSelectDate}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
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
