/**
 * Vanilla Todo - CRUD + 필터 + 일간 뷰 + localStorage
 *
 * 영속화 설계
 *   - 단일 진실의 출처는 여전히 메모리상의 todos 배열.
 *   - todos 가 바뀔 때마다 localStorage 에도 같은 내용을 저장한다.
 *   - 페이지 로드 시 localStorage 에서 한 번 불러와 todos 의 초기값으로 쓴다.
 *
 *   객체/배열은 그대로 저장할 수 없으므로 JSON.stringify 로 직렬화,
 *   불러올 때 JSON.parse 로 역직렬화한다.
 *
 *   손상된 JSON이 있더라도 앱이 멈추지 않도록 try/catch 로 감싼다.
 */

/* ===========================
   상수
   =========================== */
const FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
};

// Date.getDay() 결과(0~6)를 사람이 읽는 문자로 매핑
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// localStorage 키. 다른 키와 충돌하지 않도록 앱 이름 prefix 를 붙인다.
const STORAGE_KEY = "vanilla-todo:todos";

/* ===========================
   localStorage 연동
   - todos 배열을 JSON 문자열로 저장/복원한다.
   =========================== */

// 저장된 todos 를 읽어온다. 없거나 깨졌으면 빈 배열을 반환한다.
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    // 혹시 배열이 아닌 값이 저장돼 있으면 무시한다.
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    // 깨진 JSON 등 예외 상황: 콘솔에만 남기고 빈 배열로 시작한다.
    console.warn("localStorage 에서 todos 를 불러오지 못했습니다.", error);
    return [];
  }
}

// 현재 todos 를 JSON 문자열로 저장한다.
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    // 용량 초과 등으로 실패해도 메모리상 상태는 유지된다.
    console.warn("localStorage 에 todos 를 저장하지 못했습니다.", error);
  }
}

/* ===========================
   상태
   =========================== */
// Todo 객체 형태: { id, text, completed, date }
let todos = loadTodos(); // 페이지 로드 시 한 번 복원
let currentFilter = FILTERS.ALL;
let selectedDate = formatDate(new Date()); // 초기값: 오늘

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
   =========================== */

// Date → "YYYY-MM-DD" (로컬 시간 기준)
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// "YYYY-MM-DD" → Date (로컬 자정)
function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// 날짜 문자열에 일수를 더하거나 빼서 새 문자열을 반환
function shiftDate(dateString, deltaDays) {
  const next = parseDate(dateString);
  next.setDate(next.getDate() + deltaDays);
  return formatDate(next);
}

// 사람이 보기 좋은 라벨로 변환. 예: "2026년 6월 2일 (화)"
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

// selectedDate 와 currentFilter 를 모두 적용해 보여줄 todos 를 반환
function getVisibleTodos() {
  return todos
    .filter((todo) => todo.date === selectedDate)
    .filter((todo) => {
      if (currentFilter === FILTERS.ACTIVE) return !todo.completed;
      if (currentFilter === FILTERS.COMPLETED) return todo.completed;
      return true;
    });
}

/* ===========================
   액션
   - 상태(todos) 변경 → saveTodos() → render() 순서를 지킨다.
   =========================== */

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
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
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
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

function setFilter(nextFilter) {
  // 필터는 화면 상태일 뿐 데이터를 바꾸지 않으므로 저장하지 않는다.
  const allowed = Object.values(FILTERS);
  if (!allowed.includes(nextFilter)) return;
  currentFilter = nextFilter;
  render();
}

function shiftSelectedDay(deltaDays) {
  // 선택된 날짜도 화면 상태일 뿐 데이터를 바꾸지 않으므로 저장하지 않는다.
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

// 날짜 이동
$prevDayButton.addEventListener("click", () => shiftSelectedDay(-1));
$nextDayButton.addEventListener("click", () => shiftSelectedDay(1));

/* ===========================
   초기 렌더
   =========================== */
render();
