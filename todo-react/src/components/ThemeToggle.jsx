/* ThemeToggle — 라이트/다크 모드 토글 버튼.
 * 1차 .theme-toggle 과 동일한 형태(원형, 테두리, 호버 시 primary).
 *
 * - theme: 'light' | 'dark'
 * - onToggle(): 클릭 시 부모(TodoApp)가 theme 을 반대로 뒤집는다.
 *
 * 자체 상태 없음 — 표시할 아이콘만 theme 으로 결정한다.
 * 라이트일 때 달(다음으로 갈 상태) / 다크일 때 해 를 보여줘서
 * "클릭하면 어디로 갈지" 를 직관적으로 전달한다 (1차 동일). */

// 인라인 SVG 로 두면 외부 의존성 없이 색이 currentColor 로 따라오므로 토큰과 잘 어울린다.
function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-primary hover:border-primary"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

export default ThemeToggle
