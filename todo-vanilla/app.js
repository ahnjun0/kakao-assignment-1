/**
 * Vanilla Todo - 기본 CRUD
 *
 * 흐름
 *   사용자 액션 → todos 상태 변경 → render() 호출 → 화면이 todos 그대로 다시 그려진다.
 *   "상태가 단 하나의 출처(todos)이고, 화면은 그 결과물"이라는 원칙을 지킨다.
 *   이렇게 짜두면 이후 React 전환 시 그대로 옮길 수 있다.
 */

/* ===========================
   상태
   =========================== */
// Todo 객체 형태: { id: number, text: string, completed: boolean }
let todos = [];

/* ===========================
   DOM 참조
   - 자주 쓰는 엘리먼트는 미리 캐싱
   =========================== */
const $form = document.getElementById("todo-form");
const $input = document.getElementById("todo-input-field");
const $message = document.getElementById("input-message");
const $list = document.getElementById("todo-list");
const $emptyMessage = document.getElementById("empty-message");

/* ===========================
   액션 함수 (Create / Update / Delete)
   - 상태(todos)만 바꾸고, 마지막에 render()를 호출한다.
   =========================== */

// 새 Todo를 만든다.
function addTodo(text) {
  const trimmed = text.trim();

  // 빈 입력 가드: 생성하지 않고 안내 메시지만 보여준다.
  if (!trimmed) {
    $message.textContent = "할 일을 입력해주세요.";
    return;
  }

  todos.push({
    id: Date.now(), // 시간 기반 고유 id (수정/삭제 시 식별자로 사용)
    text: trimmed,
    completed: false,
  });

  // 입력 후 정리
  $message.textContent = "";
  $input.value = "";
  render();
}

// 완료 상태를 켜고 끈다.
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  render();
}

// prompt로 새 텍스트를 받아 수정한다.
function editTodo(id) {
  const target = todos.find((todo) => todo.id === id);
  if (!target) return;

  const nextText = prompt("수정할 내용을 입력하세요.", target.text);

  // 취소(null)나 공백만 입력한 경우엔 기존 값을 유지
  if (nextText === null) return;
  const trimmed = nextText.trim();
  if (!trimmed) return;

  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, text: trimmed } : todo
  );
  render();
}

// 해당 id의 Todo를 목록에서 제거한다.
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  render();
}

/* ===========================
   렌더 (Read)
   - 현재 todos를 바탕으로 화면을 다시 그린다.
   - 매번 innerHTML을 비우고 새로 그리는 단순한 방식.
     (Todo 수가 적으므로 성능 이슈 없음)
   =========================== */
function render() {
  $list.innerHTML = "";

  todos.forEach((todo) => {
    $list.appendChild(createTodoElement(todo));
  });

  // 목록이 비었을 때만 빈 상태 메시지 표시
  $emptyMessage.hidden = todos.length !== 0;
}

// Todo 하나에 해당하는 <li>를 만든다.
function createTodoElement(todo) {
  const $item = document.createElement("li");
  $item.className = "todo-list__item";
  if (todo.completed) $item.classList.add("is-completed");
  // data-id에 id를 저장해두면 클릭 이벤트에서 어떤 항목인지 식별할 수 있다.
  $item.dataset.id = String(todo.id);

  const $text = document.createElement("span");
  $text.className = "todo-list__text";
  $text.textContent = todo.text;

  // 수정 버튼
  const $editButton = document.createElement("button");
  $editButton.type = "button";
  $editButton.className = "todo-list__action";
  $editButton.dataset.action = "edit";
  $editButton.textContent = "수정";

  // 완료 토글 버튼: 상태에 따라 라벨이 바뀐다.
  const $toggleButton = document.createElement("button");
  $toggleButton.type = "button";
  $toggleButton.className = "todo-list__action is-primary";
  $toggleButton.dataset.action = "toggle";
  $toggleButton.textContent = todo.completed ? "되돌리기" : "완료";

  // 삭제 버튼
  const $deleteButton = document.createElement("button");
  $deleteButton.type = "button";
  $deleteButton.className = "todo-list__action is-danger";
  $deleteButton.dataset.action = "delete";
  $deleteButton.textContent = "삭제";

  $item.append($text, $editButton, $toggleButton, $deleteButton);
  return $item;
}

/* ===========================
   이벤트 바인딩
   =========================== */

// 입력 폼 제출: 추가 버튼 클릭과 Enter 키를 한 번에 처리
$form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo($input.value);
});

// 사용자가 다시 입력을 시작하면 이전 에러 메시지를 지운다.
$input.addEventListener("input", () => {
  if ($message.textContent) $message.textContent = "";
});

// 리스트 클릭은 부모 ul에 한 번만 바인딩 (이벤트 위임).
// li마다 리스너를 달 필요가 없어 효율적이고, 새로 렌더된 항목에도 자동 적용된다.
$list.addEventListener("click", (event) => {
  const $button = event.target.closest("button[data-action]");
  if (!$button) return;

  const $item = $button.closest(".todo-list__item");
  if (!$item) return;

  const id = Number($item.dataset.id);
  const action = $button.dataset.action;

  if (action === "edit") editTodo(id);
  if (action === "toggle") toggleTodo(id);
  if (action === "delete") deleteTodo(id);
});

/* ===========================
   초기 렌더
   =========================== */
render();
