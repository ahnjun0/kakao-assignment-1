/**
 * Vanilla Todo - CRUD + 필터 + 일간 뷰 + 주간 뷰 + localStorage
 *
 * 주간 뷰 설계
 *   - 별도의 weekStart 상태를 두지 않고, selectedDate 하나만 진실의 출처로 유지한다.
 *   - 화면에 그릴 주는 "selectedDate 가 속한 주의 월요일~일요일"로 매번 계산한다.
 *   - 이전 주차 / 다음 주차 버튼은 selectedDate 를 ±7일 이동시킨다.
 *     → 주가 자동으로 옮겨지고, 일간 뷰의 날짜 라벨도 함께 갱신된다.
 *   - 셀 클릭 시 selectedDate 를 해당 날짜로 바꾼다.
 *
 *   장점: 상태 동기화 이슈가 없다.
 *   한계: "이번 주 보기"가 항상 selectedDate 를 따라간다. 의도와 일치한다.
 */

/* ===========================
   상수
   =========================== */
const FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
};

// Date.getDay() 결과(0~6, 일=0) 매핑
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
// 주간 뷰는 월요일부터 시작하므로 표기 순서를 따로 만든다.
const WEEK_VIEW_WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

const STORAGE_KEY = "vanilla-todo:todos";

/* ===========================
   localStorage 연동
   =========================== */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn("localStorage 에서 todos 를 불러오지 못했습니다.", error);
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.warn("localStorage 에 todos 를 저장하지 못했습니다.", error);
  }
}

/* ===========================
   상태
   =========================== */
let todos = loadTodos();
let currentFilter = FILTERS.ALL;
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
const $weekList = document.getElementById("week-list");
const $prevWeekButton = document.getElementById("prev-week-button");
const $nextWeekButton = document.getElementById("next-week-button");

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

// 주어진 날짜가 속한 주의 "월요일" 날짜 문자열을 반환한다.
//   JS getDay(): 일=0, 월=1, ..., 토=6
//   월요일까지의 차이:
//     월(1) → 0,  화(2) → -1,  수(3) → -2,  ...  토(6) → -5
//     일(0) → -6  (지난 월요일까지 6일 전)
function getWeekStart(dateString) {
  const date = parseDate(dateString);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return formatDate(date);
}

// 주어진 날짜가 속한 주의 7일 날짜 배열을 반환한다 (월~일 순).
function getWeekDates(dateString) {
  const start = getWeekStart(dateString);
  return Array.from({ length: 7 }, (_, index) => shiftDate(start, index));
}

// 특정 날짜의 Todo 개수
function countTodosByDate(dateString) {
  return todos.filter((todo) => todo.date === dateString).length;
}

/* ===========================
   순수 함수: 필터링
   =========================== */
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
    date: selectedDate,
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
  const allowed = Object.values(FILTERS);
  if (!allowed.includes(nextFilter)) return;
  currentFilter = nextFilter;
  render();
}

function shiftSelectedDay(deltaDays) {
  selectedDate = shiftDate(selectedDate, deltaDays);
  render();
}

// 주간 뷰의 셀을 클릭했을 때 호출
function setSelectedDate(dateString) {
  selectedDate = dateString;
  render();
}

/* ===========================
   렌더
   =========================== */
function render() {
  renderDateBar();
  renderWeekView();
  renderFilterButtons();
  renderTodoList();
}

function renderDateBar() {
  $selectedDateLabel.textContent = formatDateLabel(selectedDate);
}

// 주간 뷰: selectedDate 가 속한 주의 7일을 그린다.
function renderWeekView() {
  const today = formatDate(new Date());
  const weekDates = getWeekDates(selectedDate);

  $weekList.innerHTML = "";
  weekDates.forEach((dateString, index) => {
    $weekList.appendChild(createWeekDayElement(dateString, index, today));
  });
}

// 주간 뷰의 한 셀(<li>)을 만든다.
function createWeekDayElement(dateString, weekdayIndex, todayString) {
  const $item = document.createElement("li");
  $item.className = "week-view__day";
  $item.dataset.date = dateString; // 클릭 위임에서 사용
  $item.setAttribute("role", "button");
  $item.setAttribute("tabindex", "0");
  $item.setAttribute("aria-label", formatDateLabel(dateString));

  if (dateString === todayString) $item.classList.add("is-today");
  if (dateString === selectedDate) $item.classList.add("is-selected");

  const $weekday = document.createElement("span");
  $weekday.className = "week-view__day-weekday";
  $weekday.textContent = WEEK_VIEW_WEEKDAYS[weekdayIndex];

  const $dayNumber = document.createElement("span");
  $dayNumber.className = "week-view__day-number";
  $dayNumber.textContent = String(parseDate(dateString).getDate());

  const $count = document.createElement("span");
  $count.className = "week-view__day-count";
  const count = countTodosByDate(dateString);
  $count.textContent = count > 0 ? `${count}개` : "";

  $item.append($weekday, $dayNumber, $count);
  return $item;
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

// 날짜 이동 (일간)
$prevDayButton.addEventListener("click", () => shiftSelectedDay(-1));
$nextDayButton.addEventListener("click", () => shiftSelectedDay(1));

// 주차 이동: selectedDate 를 7일 단위로 이동시키면 주간 뷰가 자동으로 옮겨진다.
$prevWeekButton.addEventListener("click", () => shiftSelectedDay(-7));
$nextWeekButton.addEventListener("click", () => shiftSelectedDay(7));

// 주간 뷰 셀 클릭: 이벤트 위임으로 어떤 날짜인지 식별
$weekList.addEventListener("click", (event) => {
  const $day = event.target.closest(".week-view__day");
  if (!$day) return;
  setSelectedDate($day.dataset.date);
});

// 접근성: Enter / Space 로도 날짜 선택 가능
$weekList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const $day = event.target.closest(".week-view__day");
  if (!$day) return;
  event.preventDefault();
  setSelectedDate($day.dataset.date);
});

/* ===========================
   초기 렌더
   =========================== */
render();
