import { useEffect, useState } from 'react'
import DateHeader from './DateHeader'
import WeekView from './WeekView'
import TodoInput from './TodoInput'
import FilterTabs from './FilterTabs'
import TodoList from './TodoList'
import ThemeToggle from './ThemeToggle'
import { todayString, addDays, getWeekStart } from '../utils/date'

/* TodoApp — 모든 상태와 핸들러의 단일 출처(single source of truth).
 *
 * [상태]
 * - todos: { id, text, done, date } 배열 (localStorage 영속화)
 * - selectedDate: 일간 뷰가 보고 있는 날짜 (휘발성)
 * - currentFilter: 'all' | 'active' | 'done' (휘발성)
 * - weekStartDate: 주간 뷰의 월요일 (localStorage 영속화)
 * - theme: 'light' | 'dark' (localStorage 영속화)
 *
 * [영속화 전략]
 * - todos, weekStartDate, theme 만 저장. selectedDate/currentFilter 는 매번 초기화.
 * - 함수형 useState 초기화 + useEffect 동기화 패턴 (외부 동기화는 effect 전용 — React 원칙 3).
 *
 * [selectedDate ↔ weekStartDate 관계]
 * 두 값은 독립이지만, 일간 ◀▶ 이 주 범위를 넘으면 주간 뷰가 자동 추종한다.
 * 이건 effect 가 아니라 핸들러에서 즉시 처리 (ensureWeekContains). */

const STORAGE_KEY_TODOS = 'todos'
const STORAGE_KEY_WEEK = 'weekStartDate'
const STORAGE_KEY_THEME = 'theme'

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

function loadWeekStart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WEEK)
    if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) return saved
  } catch {}
  return getWeekStart(todayString())
}

// 초기 theme 은 index.html 의 인라인 스크립트가 이미 <html data-theme> 에 세팅해놨다.
// 그 값을 다시 읽어서 React state 와 동기화 — 두 채널이 어긋나지 않도록.
function loadTheme() {
  const fromDom = document.documentElement.dataset.theme
  if (fromDom === 'dark' || fromDom === 'light') return fromDom
  return 'light'
}

// --- 순수 함수 ---

// 1) 선택 날짜로 필터 → 2) all/active/done 필터 → 3) 완료 항목을 아래로 정렬.
// Array.prototype.sort 는 안정 정렬(ECMAScript 2019+) 이라 같은 done 끼리는 원래 순서가 유지된다.
function getVisibleTodos(todos, selectedDate, filter) {
  const sameDate = todos.filter((todo) => todo.date === selectedDate)
  const filtered =
    filter === 'active'
      ? sameDate.filter((todo) => !todo.done)
      : filter === 'done'
        ? sameDate.filter((todo) => todo.done)
        : sameDate
  // [...filtered] 로 새 배열을 만들고 sort — 원본 mutate 방지.
  return [...filtered].sort((a, b) => Number(a.done) - Number(b.done))
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
  const [theme, setTheme] = useState(loadTheme)

  const todayDate = todayString()

  // 영속화: todos / weekStartDate 가 바뀔 때마다 자동 저장.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WEEK, weekStartDate)
  }, [weekStartDate])

  // theme 변경 시 DOM 속성 갱신 + localStorage 저장.
  // <html data-theme> 변경은 React 가 직접 관리하지 않는 외부 자원이므로 effect 에서 처리한다.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY_THEME, theme)
  }, [theme])

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

  // selectedDate 가 보이는 주 범위를 벗어나면 weekStartDate 를 그 주차로 옮긴다.
  // 'YYYY-MM-DD' 의 사전식 비교가 곧 날짜 비교라 < > 가 그대로 동작한다.
  function ensureWeekContains(dateString) {
    const weekEnd = addDays(weekStartDate, 6)
    if (dateString < weekStartDate || dateString > weekEnd) {
      setWeekStartDate(getWeekStart(dateString))
    }
  }

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

  // "오늘로" 버튼: selectedDate 를 오늘로 + 주간 뷰도 오늘이 속한 주로.
  function handleGoToday() {
    setSelectedDate(todayDate)
    ensureWeekContains(todayDate)
  }

  function handlePrevWeek() {
    setWeekStartDate((current) => addDays(current, -7))
  }
  function handleNextWeek() {
    setWeekStartDate((current) => addDays(current, 7))
  }

  // 주간 뷰 칸 클릭 또는 달력 팝오버에서 날짜 선택 → selectedDate 만 변경.
  function handleSelectDate(dateString) {
    setSelectedDate(dateString)
  }

  function handleToggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const visibleTodos = getVisibleTodos(todos, selectedDate, currentFilter)
  const emptyMessage = EMPTY_MESSAGE[currentFilter]

  return (
    <main className="min-h-screen bg-bg">
      <section className="max-w-[520px] mx-auto my-12 p-6 bg-surface rounded-[10px] shadow-sm">
        <header className="flex items-center justify-between mb-4">
          <h1 className="m-0 text-2xl text-primary font-medium">Todo</h1>
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        </header>

        <DateHeader
          selectedDate={selectedDate}
          todayDate={todayDate}
          todos={todos}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onGoToday={handleGoToday}
          onSelectDate={handleSelectDate}
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
