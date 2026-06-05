import TodoItem from './TodoItem'

/* TodoList — Todo 배열 → li 렌더링.
 * 1차 .todo-list 와 동일한 룩.
 *
 * - todos: 이미 필터/날짜로 거른 배열 (필터링 책임은 TodoApp 에 있다).
 * - emptyMessage: 빈 상태일 때 보여줄 안내 문구.
 *                 TodoList 는 "왜 비었는지(필터 때문인지 데이터가 없는지)" 를 모른다 —
 *                 그 판단은 TodoApp 의 책임이고, 여기는 결과 문구만 받아 표시한다.
 * - onToggle / onEdit / onDelete: 그대로 TodoItem 에 전달.
 *
 * key 는 안정된 todo.id 사용 (React 원칙 4 — index 금지).
 * todos 기본값 [] 로 undefined 방어 (2ND_TOR §5). */
function TodoList({
  todos = [],
  emptyMessage = '등록된 할 일이 없습니다.',
  onToggle,
  onEdit,
  onDelete,
}) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-muted py-6 m-0">{emptyMessage}</p>
    )
  }

  return (
    <ul className="list-none p-0 m-0">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TodoList
