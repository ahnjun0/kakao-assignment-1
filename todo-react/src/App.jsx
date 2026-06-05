import TodoApp from './components/TodoApp'

/* App은 진입점만 담당하고 실제 화면은 TodoApp에 위임한다.
 * 이렇게 분리해 두면 추후 라우터/레이아웃이 들어와도 App만 손대면 된다. */
function App() {
  return <TodoApp />
}

export default App
