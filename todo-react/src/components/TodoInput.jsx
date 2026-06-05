import { useState } from 'react'

/* TodoInput — 새 Todo 입력창 + 추가 버튼.
 * 1차 .todo-input 과 동일한 룩: 흰 배경 인풋 + primary 색 추가 버튼.
 * 입력 텍스트는 이 컴포넌트만 쓰는 값이라 로컬 state (state co-location).
 * - onAdd(text): 부모(TodoApp)에 새 항목 추가 요청.
 *
 * 빈 입력 가드/안내 메시지는 3단계에서 구현. 자리는 .todo-input__message 로 잡아둔다. */
function TodoInput({ onAdd }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onAdd(text)
    setText('')
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="할 일을 입력하세요"
          className="flex-1 p-3 text-sm bg-surface text-ink border border-border rounded-md outline-none focus:border-primary placeholder:text-muted"
        />
        <button
          type="submit"
          className="px-4 bg-primary text-white font-semibold rounded-md"
        >
          추가
        </button>
      </form>

      {/* 안내 메시지 자리. 3단계에서 빈 입력 시 노출 */}
      <p className="mt-2 mb-4 text-xs text-danger min-h-4" />
    </>
  )
}

export default TodoInput
