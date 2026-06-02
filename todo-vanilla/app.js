/**
 * Vanilla Todo - CRUD + 상태별 필터링
 *
 * 흐름
 *   사용자 액션 → 상태(todos / currentFilter) 변경 → render() 호출 → 화면이 다시 그려진다.
 *   "상태가 단 하나의 출처이고, 화면은 그 결과물"이라는 원칙을 지킨다.
 *
 *   필터링은 "원본 todos는 그대로 두고, 그릴 때만 걸러서 보여준다"는 관점으로 구현한다.
 *   → 필터를 바꿔도 데이터는 손상되지 않는다.
 */

/* ===========================
   상수
   =========================== */
// 필터 값은 문자열을 직접 쓰면 오타가 나기 쉬워 상수로 모아둔다.
const FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
};

/* ===========================
   상태
   =========================== */
// Todo 객체 형태: { id: number, text: string, completed: boolean }
let todos = [];

// 현재 선택된 필터. 기본값은 "전체".
let currentFilter = FILTERS.ALL;

/* ===========================
   DOM 참조
   =========================== */
const $form = document.getElementById("todo-form");
const $input = document.getElementById("todo-input-field");
const $message = document.getElementById("input-message");
const $list = document.getElementById("todo-list");
const $emptyMessage = document.getElementById("empty-message");
const $filterButtons = document.querySelectorAll(".filter-bar__button");

/* ===========================
   순수 함수
   - 입력만 받아 결과를 반환. DOM이나 외부 상태를 만지지 않는다.
   - 테스트하기 쉽고, 이후 React로 옮길 때도 그대로 재사용된다.
   =========================== */

// 현재 필터를 적용해 "보여줄 todos"를 반환한다.
function getVisibleTodos() {
  if (currentFilter === FILTERS.ACTIVE) {
    return todos.filter((todo) => !todo.completed);
  }
  if (currentFilter === FILTERS.COMPLETED) {
    return todos.filter((todo) => todo.completed);
  }
  return todos; // "all"
}

/* ===========================
   액션 함수 (Create / Update / Delete)
   - 상태(todos)만 바꾸고, 마지막에 render() 호출
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
    id: Date.now(), // 시간 기반 고유 id
    text: trimmed,
    completed: false,
  });

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

  // 취소(null)나 공백만 입력한 경우 기존 값을 유지
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

// 필터를 바꾼다. 원본 todos는 건드리지 않는다.
function setFilter(nextFilter) {
  // 알 수 없는 값이 들어오면 무시 (방어적 처리)
  const allowed = Object.values(FILTERS);
  if (!allowed.includes(nextFilter)) return;

  currentFilter = nextFilter;
  render();
}

/* ===========================
   렌더 (Read)
   - render() 한 번이 화면 전체를 다시 그리는 진입점.
   - 세부 렌더는 책임별로 작은 함수로 분리한다.
   =========================== */
function render() {
  renderFilterButtons();
  renderTodoList();
}

// 필터 버튼의 활성 상태를 현재 필터에 맞춰 동기화한다.
function renderFilterButtons() {
  $filterButtons.forEach(($button) => {
    const isActive = $button.dataset.filter === currentFilter;
    $button.classList.toggle("is-active", isActive);
    // 접근성: 스크린리더에 현재 선택된 탭임을 알린다.
    $button.setAttribute("aria-pressed", String(isActive));
  });
}

// 필터링된 결과를 화면에 그린다.
function renderTodoList() {
  const visibleTodos = getVisibleTodos();

  $list.innerHTML = "";
  visibleTodos.forEach((todo) => {
    $list.appendChild(createTodoElement(todo));
  });

  // 빈 상태 메시지는 "현재 필터 기준" 결과가 0개일 때 표시.
  // (전체 데이터는 있는데 "완료" 탭만 비어 있는 경우도 자연스럽게 처리됨)
  $emptyMessage.hidden = visibleTodos.length !== 0;
  $emptyMessage.textContent = getEmptyMessageText();
}

// 필터에 따라 빈 상태 안내 문구를 다르게 보여준다.
function getEmptyMessageText() {
  if (currentFilter === FILTERS.ACTIVE) return "진행 중인 할 일이 없습니다.";
  if (currentFilter === FILTERS.COMPLETED) return "완료된 할 일이 없습니다.";
  return "등록된 할 일이 없습니다.";
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

// 필터 버튼 클릭: 각 버튼의 data-filter 값을 그대로 setFilter에 넘긴다.
$filterButtons.forEach(($button) => {
  $button.addEventListener("click", () => {
    setFilter($button.dataset.filter);
  });
});

/* ===========================
   초기 렌더
   =========================== */
render();
