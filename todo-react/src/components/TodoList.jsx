import TodoItem from './TodoItem'

/* TodoList — Todo 배열 → li 렌더링.
 * 1차 .todo-list__empty 와 동일한 룩으로 빈 상태 메시지를 보여준다.
 * - todos: 이미 필터/날짜로 거른 배열 (필터링 책임은 TodoApp).
 * - onToggle / onEdit / onDelete: 그대로 TodoItem 에 전달.
 *
 * key 는 안정된 todo.id 사용 (React 원칙 4 — index 금지).
 * todos 기본값 [] 로 undefined 방어 (2ND_TOR §5). */
function TodoList({ todos = [], onToggle, onEdit, onDelete }) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-muted py-6 m-0">
        등록된 할 일이 없습니다.
      </p>
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
