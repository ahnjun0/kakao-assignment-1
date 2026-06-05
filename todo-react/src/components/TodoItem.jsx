/* TodoItem — Todo 한 줄.
 * 1차 .todo-list__item 과 동일한 룩: 체크박스 + 텍스트 + 수정/삭제 액션 버튼.
 * - todo: { id, text, done, date }
 * - onToggle(id) / onEdit(id, nextText) / onDelete(id)
 *
 * 인라인 수정 상태(isEditing)는 이 항목만 쓰므로 여기서 로컬 state 로 관리 예정 (3단계).
 * 골격 단계에서는 표시만. 완료 항목은 취소선 + 흐림. */
function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  return (
    <li className="flex items-center gap-2 py-3 border-b border-border">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        className="w-[18px] h-[18px] cursor-pointer accent-primary shrink-0"
      />

      <span
        className={
          'flex-1 text-left break-words cursor-text ' +
          (todo.done ? 'line-through text-muted' : 'text-ink')
        }
      >
        {todo.text}
      </span>

      {/* 액션 버튼: 1차의 .todo-list__action.is-primary / .is-danger 색 매칭 */}
      <button
        type="button"
        onClick={() => onEdit(todo.id, todo.text)}
        className="px-2 py-1 text-xs rounded-md border border-primary text-primary bg-surface"
      >
        수정
      </button>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        className="px-2 py-1 text-xs rounded-md border border-danger text-danger bg-surface"
      >
        삭제
      </button>
    </li>
  )
}

export default TodoItem
