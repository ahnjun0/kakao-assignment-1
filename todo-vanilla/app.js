/**
 * Vanilla Todo - CRUD + 필터 + 일간 뷰
 *
 * 흐름
 *   사용자 액션 → 상태(todos / currentFilter / selectedDate) 변경
 *               → render() 호출 → 화면이 다시 그려진다.
 *
 * 일간 뷰 설계
 *   - todos 배열은 모든 날짜의 Todo를 한 곳에 모아둔다.
 *   - 화면에 그릴 때 selectedDate와 일치하는 Todo만 걸러낸다.
 *   - 데이터(저장용)와 표시(사용자용) 포맷을 분리한다:
 *       저장 / 비교: "YYYY-MM-DD" 문자열
 *       표시:        "YYYY년 M월 D일 (요일)"
 *   - 날짜 계산은 반드시 로컬 시간 기준. toISOString()은 UTC라 한국 시간에서
 *     하루 밀릴 수 있으므로 사용하지 않는다.
 */

/* ===========================
   상수
   =========================== */
const FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
};

// 요일 표시용 (Date.getDay() 결과 0~6에 매핑)
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/* ===========================
   상태
   =========================== */
// Todo 객체 형태: { id: number, text: string, completed: boolean, date: "YYYY-MM-DD" }
let todos = [];

// 현재 선택된 필터.
let currentFilter = FILTERS.ALL;

// 현재 선택된 날짜. 초기값은 "오늘".
let selectedDate = formatDate(new Date());

/* ===========================
   DOM 참조
   =========================== */
const $form = document.getElementById("todo-form");
const $input = document.getElementById("todo-input-field");
const $message = document.getElementById("input-message");
const $list = document.getElementById("todo-list");
const $emptyMessage = document.getElementById("empty-message");
const $filterButtons = document.querySelectorAll(".filter-bar__button");
const $selectedDateLabel = document.getElementById("selected-date-label");
const $prevDayButton = document.getElementById("prev-day-button");
const $nextDayButton = document.getElementById("next-day-button");

/* ===========================
   순수 함수: 날짜 유틸
   - DOM과 외부 상태를 만지지 않는다.
   =========================== */

// Date 객체를 "YYYY-MM-DD" 문자열로 변환한다 (로컬 시간 기준).
// toISOString()은 UTC라 한국 시간에서 하루 밀릴 수 있으므로 직접 만든다.
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// "YYYY-MM-DD" 문자열을 로컬 자정 Date 객체로 되돌린다.
function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// 날짜 문자열에 일수를 더하거나 빼서 새 문자열을 반환한다.
//   shiftDate("2026-06-02", 1)  // "2026-06-03"
//   shiftDate("2026-06-02", -1) // "2026-06-01"
function shiftDate(dateString, deltaDays) {
  const next = parseDate(dateString);
  next.setDate(next.getDate() + deltaDays);
  return formatDate(next);
}

// 사람이 보기 좋은 라벨로 변환한다. 예: "2026년 6월 2일 (화)"
function formatDateLabel(dateString) {
  const date = parseDate(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAY_LABELS[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

/* ===========================
   순수 함수: 필터링
   =========================== */

// 현재 selectedDate와 currentFilter를 모두 적용해 "보여줄 todos"를 반환한다.
function getVisibleTodos() {
  return todos
    .filter((todo) => todo.date === selectedDate) // 1) 날짜로 거르고
    .filter((todo) => {                            // 2) 상태 필터로 다시 거른다
      if (currentFilter === FILTERS.ACTIVE) return !todo.completed;
      if (currentFilter === FILTERS.COMPLETED) return todo.completed;
      return true;
    });
}

/* ===========================
   액션 함수
   - 상태만 바꾸고, 마지막에 render() 호출
   =========================== */

// 새 Todo를 만든다. 현재 선택된 날짜를 함께 저장한다.
function addTodo(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    $message.textContent = "할 일을 입력해주세요.";
    return;
  }

  todos.push({
    id: Date.now(),
    text: trimmed,
    completed: false,
    date: selectedDate, // 어느 날의 할 일인지 함께 보관
  });

  $message.textContent = "";
  $input.value = "";
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  render();
}

function editTodo(id) {
  const target = todos.find((todo) => todo.id === id);
  if (!target) return;

  const nextText = prompt("수정할 내용을 입력하세요.", target.text);
  if (nextText === null) return;
  const trimmed = nextText.trim();
  if (!trimmed) return;

  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, text: trimmed } : todo
  );
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  render();
}

function setFilter(nextFilter) {
  const allowed = Object.values(FILTERS);
  if (!allowed.includes(nextFilter)) return;
  currentFilter = nextFilter;
  render();
}

// 선택된 날짜를 deltaDays만큼 이동시킨다.
//   shiftSelectedDay(-1) → 어제
//   shiftSelectedDay(1)  → 내일
function shiftSelectedDay(deltaDays) {
  selectedDate = shiftDate(selectedDate, deltaDays);
  render();
}

/* ===========================
   렌더
   =========================== */
function render() {
  renderDateBar();
  renderFilterButtons();
  renderTodoList();
}

// 날짜 바: 현재 선택된 날짜를 사람이 보기 좋은 라벨로 표시
function renderDateBar() {
  $selectedDateLabel.textContent = formatDateLabel(selectedDate);
}

function renderFilterButtons() {
  $filterButtons.forEach(($button) => {
    const isActive = $button.dataset.filter === currentFilter;
    $button.classList.toggle("is-active", isActive);
    $button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderTodoList() {
  const visibleTodos = getVisibleTodos();

  $list.innerHTML = "";
  visibleTodos.forEach((todo) => {
    $list.appendChild(createTodoElement(todo));
  });

  $emptyMessage.hidden = visibleTodos.length !== 0;
  $emptyMessage.textContent = getEmptyMessageText();
}

// 빈 상태 문구를 현재 필터에 맞춰 다르게 보여준다.
function getEmptyMessageText() {
  if (currentFilter === FILTERS.ACTIVE) return "진행 중인 할 일이 없습니다.";
  if (currentFilter === FILTERS.COMPLETED) return "완료된 할 일이 없습니다.";
  return "이 날짜에 등록된 할 일이 없습니다.";
}

function createTodoElement(todo) {
  const $item = document.createElement("li");
  $item.className = "todo-list__item";
  if (todo.completed) $item.classList.add("is-completed");
  $item.dataset.id = String(todo.id);

  const $text = document.createElement("span");
  $text.className = "todo-list__text";
  $text.textContent = todo.text;

  const $editButton = document.createElement("button");
  $editButton.type = "button";
  $editButton.className = "todo-list__action";
  $editButton.dataset.action = "edit";
  $editButton.textContent = "수정";

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

$form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo($input.value);
});

$input.addEventListener("input", () => {
  if ($message.textContent) $message.textContent = "";
});

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

$filterButtons.forEach(($button) => {
  $button.addEventListener("click", () => {
    setFilter($button.dataset.filter);
  });
});

// 날짜 이동: 이전 / 다음 버튼
$prevDayButton.addEventListener("click", () => shiftSelectedDay(-1));
$nextDayButton.addEventListener("click", () => shiftSelectedDay(1));

/* ===========================
   초기 렌더
   =========================== */
render();
