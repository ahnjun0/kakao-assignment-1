import { useState } from 'react'

/* TodoItem — Todo 한 줄.
 * 1차 .todo-list__item 과 동일한 룩.
 * - todo: { id, text, done, date }
 * - onToggle(id) / onEdit(id, nextText) / onDelete(id)
 *
 * 인라인 수정 상태는 이 항목만 쓰는 값이라 여기서 로컬 state 로 관리한다.
 * - isEditing: 현재 수정 모드 여부
 * - draftText: 수정 중인 텍스트 (확정 전까지는 todo.text 와 분리)
 *
 * 1차에서 합의했던 UX:
 *   Enter / 확인 버튼 → 저장,  Esc → 취소,  blur → 저장,  빈 값 → 취소(원본 유지) */
function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftText, setDraftText] = useState(todo.text)

  // 수정 모드 진입: 현재 텍스트를 draft 로 복사하고 input 으로 전환.
  function enterEditMode() {
    setDraftText(todo.text)
    setIsEditing(true)
  }

  // 저장: 빈 값이면 취소 처리 (원본 유지). 변경 없으면 부모 호출 생략.
  function commitEdit() {
    const trimmed = draftText.trim()
    if (trimmed.length === 0) {
      setIsEditing(false)
      return
    }
    if (trimmed !== todo.text) {
      onEdit(todo.id, trimmed)
    }
    setIsEditing(false)
  }

  function cancelEdit() {
    setDraftText(todo.text)
    setIsEditing(false)
  }

  // 키보드 단축키: Enter 저장, Esc 취소.
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitEdit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
    }
  }

  return (
    <li className="flex items-center gap-2 py-3 border-b border-border">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        className="w-[18px] h-[18px] cursor-pointer accent-primary shrink-0"
      />

      {isEditing ? (
        // 인라인 수정 모드: 텍스트 자리를 input 으로 교체.
        // autoFocus 로 진입 즉시 커서가 들어가고, blur 시 저장.
        <input
          type="text"
          value={draftText}
          onChange={(event) => setDraftText(event.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 px-2 py-1 text-sm bg-surface text-ink border border-primary rounded-md outline-none"
        />
      ) : (
        // 일반 모드: 더블클릭으로도 수정 진입할 수 있게 onDoubleClick 부착.
        <span
          onDoubleClick={enterEditMode}
          className={
            'flex-1 text-left break-words cursor-text ' +
            (todo.done ? 'line-through text-muted' : 'text-ink')
          }
        >
          {todo.text}
        </span>
      )}

      {/* 액션 버튼: 수정 중이면 [확인], 평소에는 [수정] 로 라벨이 바뀐다.
          삭제는 항상 보인다. */}
      {isEditing ? (
        <button
          type="button"
          // mousedown 으로 처리해야 input 의 onBlur(=commitEdit) 보다 먼저 실행되어
          // 클릭이 무시되지 않는다.
          onMouseDown={(event) => {
            event.preventDefault()
            commitEdit()
          }}
          className="px-2 py-1 text-xs rounded-md border border-primary text-primary bg-surface"
        >
          확인
        </button>
      ) : (
        <button
          type="button"
          onClick={enterEditMode}
          className="px-2 py-1 text-xs rounded-md border border-primary text-primary bg-surface"
        >
          수정
        </button>
      )}

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
