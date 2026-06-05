/* App.jsx는 최상위 컴포넌트.
 * 2단계에서 TodoApp으로 위임할 예정이라 여기서는 골격만 둔다.
 * 지금은 Tailwind v4 + @theme로 등록한 색상 토큰(--color-primary)이
 * 실제 유틸리티 클래스 bg-primary로 적용되는지 확인하는 용도. */
function App() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-primary text-white px-6 py-4 rounded-lg shadow">
        Tailwind v4 + primary 색상 토큰 적용 확인
      </div>
    </main>
  )
}

export default App
