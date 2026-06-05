import { useState } from 'react'

/* TodoInput — 새 Todo 입력창 + 추가 버튼.
 * 1차 .todo-input 과 동일한 룩. 입력 중 텍스트와 안내 메시지는 이 컴포넌트만 쓰는
 * 값이라 로컬 state 로 둔다 (state co-location).
 *
 * - onAdd(text): 부모(TodoApp)에 새 항목 추가 요청. 검증을 통과한 trim 된 텍스트만 넘긴다.
 *
 * 검증 책임은 여기에 둔다 (입력 컴포넌트의 책임).
 * 빈 입력이면 안내 메시지를 띄우고 onAdd 를 호출하지 않는다. */
function TodoInput({ onAdd }) {
  const [text, setText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(event) {
    setText(event.target.value)
    // 사용자가 다시 타이핑을 시작하면 안내 메시지를 자동으로 지운다.
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      setErrorMessage('할 일 내용을 입력하세요.')
      return
    }
    onAdd(trimmed)
    setText('')
    setErrorMessage('')
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={handleChange}
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

      {/* 안내 메시지: 메시지가 없을 때도 자리(min-h-4)를 차지하게 두어
          입력창 아래 레이아웃이 튀지 않도록 한다 (1차와 동일). */}
      <p className="mt-2 mb-4 text-xs text-danger min-h-4">
        {errorMessage}
      </p>
    </>
  )
}

export default TodoInput
