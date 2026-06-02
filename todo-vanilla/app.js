/**
 * Vanilla Todo - CRUD + 필터 + 일간/주간/달력 뷰 + localStorage
 *
 * 달력 팝오버 설계
 *   - 두 가지 상태를 추가한다: isCalendarOpen, calendarAnchor (YYYY-MM-01).
 *   - "열 때마다" calendarAnchor 를 selectedDate 의 달로 동기화한다.
 *     → 어디서 닫혔든 다시 열면 현재 선택 날짜 기준으로 보임.
 *   - 그리드는 항상 6주 × 7일 = 42칸 고정.
 *     → 달이 바뀌어도 레이아웃이 흔들리지 않음. 다른 달 날짜는 흐리게.
 *   - 닫는 방법:
 *     1) 날짜 선택   2) 바깥 클릭   3) Esc 키
 */

/* ===== 상수 ===== */
const FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
};

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const WEEK_VIEW_WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

const STORAGE_KEY = "vanilla-todo:todos";

const CALENDAR_GRID_SIZE = 42; // 6주 × 7일

/* ===== localStorage 연동 ===== */
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

/* ===== 상태 ===== */
let todos = loadTodos();
let currentFilter = FILTERS.ALL;
let selectedDate = formatDate(new Date());

// 달력 상태
let isCalendarOpen = false;
let calendarAnchor = getMonthStart(selectedDate); // 현재 보고 있는 달의 "1일"

/* ===== DOM 참조 ===== */
const $form = document.getElementById("todo-form");
const $input = document.getElementById("todo-input-field");
const $message = document.getElementById("input-message");
const $list = document.getElementById("todo-list");
const $emptyMessage = document.getElementById("empty-message");
const $filterButtons = document.querySelectorAll(".filter-bar__button");
const $dateBar = document.querySelector(".date-bar");
const $dateToggleButton = document.getElementById("date-toggle-button");
const $selectedDateLabel = document.getElementById("selected-date-label");
const $prevDayButton = document.getElementById("prev-day-button");
const $nextDayButton = document.getElementById("next-day-button");
const $goTodayButton = document.getElementById("go-today-button");
const $calendarPopover = document.getElementById("calendar-popover");
const $calendarMonthLabel = document.getElementById("calendar-month-label");
const $calendarDays = document.getElementById("calendar-days");
const $prevMonthButton = document.getElementById("prev-month-button");
const $nextMonthButton = document.getElementById("next-month-button");
const $weekList = document.getElementById("week-list");
const $prevWeekButton = document.getElementById("prev-week-button");
const $nextWeekButton = document.getElementById("next-week-button");

/* ===== 순수 함수: 날짜 유틸 ===== */

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function shiftDate(dateString, deltaDays) {
  const next = parseDate(dateString);
  next.setDate(next.getDate() + deltaDays);
  return formatDate(next);
}

function formatDateLabel(dateString) {
  const date = parseDate(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAY_LABELS[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

/* 주간 뷰용 */
function getWeekStart(dateString) {
  const date = parseDate(dateString);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return formatDate(date);
}

function getWeekDates(dateString) {
  const start = getWeekStart(dateString);
  return Array.from({ length: 7 }, (_, index) => shiftDate(start, index));
}

/* 달력용 */

// 주어진 날짜가 속한 달의 1일 문자열을 반환한다.
function getMonthStart(dateString) {
  const date = parseDate(dateString);
  date.setDate(1);
  return formatDate(date);
}

// 달 단위로 이동한다.
//   주의: setMonth() 는 날짜가 다음 달에 없으면 다음다음 달로 넘어간다.
//        (예: 1월 31일 + 1개월 → 3월 3일)
//        그래서 setDate(1) 을 먼저 호출해 항상 1일 기준으로 이동한다.
function shiftMonth(dateString, deltaMonths) {
  const date = parseDate(dateString);
  date.setDate(1);
  date.setMonth(date.getMonth() + deltaMonths);
  return formatDate(date);
}

// "YYYY년 M월" 라벨
function formatMonthLabel(monthStartString) {
  const date = parseDate(monthStartString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

// 달력 그리드(6주 × 7일)에 들어갈 42개 날짜를 만든다.
// 각 항목은 { date, isCurrentMonth } 형태.
function getCalendarGrid(monthStartString) {
  const monthStart = parseDate(monthStartString);
  const targetMonth = monthStart.getMonth();

  // 그리드는 그 달 1일이 속한 "주의 월요일" 부터 시작
  const firstWeekday = monthStart.getDay(); // 0=일
  const diffToMonday = firstWeekday === 0 ? -6 : 1 - firstWeekday;

  const gridStart = new Date(monthStart);
  gridStart.setDate(1 + diffToMonday);

  return Array.from({ length: CALENDAR_GRID_SIZE }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date: formatDate(date),
      isCurrentMonth: date.getMonth() === targetMonth,
    };
  });
}

// 특정 날짜의 "완료 / 전체" 카운트
function countTodosByDate(dateString) {
  let total = 0;
  let completed = 0;
  for (const todo of todos) {
    if (todo.date !== dateString) continue;
    total += 1;
    if (todo.completed) completed += 1;
  }
  return { total, completed };
}

/* ===== 순수 함수: 표시할 todos ===== */
function getVisibleTodos() {
  return todos
    .filter((todo) => todo.date === selectedDate)
    .filter((todo) => {
      if (currentFilter === FILTERS.ACTIVE) return !todo.completed;
      if (currentFilter === FILTERS.COMPLETED) return todo.completed;
      return true;
    })
    .sort((a, b) => Number(a.completed) - Number(b.completed));
}

/* ===== 액션 ===== */
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

function setSelectedDate(dateString) {
  selectedDate = dateString;
  render();
}

function goToToday() {
  setSelectedDate(formatDate(new Date()));
}

/* 달력 액션 */

// 달력을 열 때마다 현재 selectedDate 의 달로 동기화한다.
function openCalendar() {
  isCalendarOpen = true;
  calendarAnchor = getMonthStart(selectedDate);
  render();
}

function closeCalendar() {
  if (!isCalendarOpen) return;
  isCalendarOpen = false;
  render();
}

function toggleCalendar() {
  if (isCalendarOpen) closeCalendar();
  else openCalendar();
}

function shiftCalendarMonth(deltaMonths) {
  calendarAnchor = shiftMonth(calendarAnchor, deltaMonths);
  render();
}

// 달력에서 날짜 선택: 선택일 갱신 + 팝오버 닫기
function selectDateFromCalendar(dateString) {
  selectedDate = dateString;
  isCalendarOpen = false;
  render();
}

/* ===== 렌더 ===== */
function render() {
  renderDateBar();
  renderCalendar();
  renderWeekView();
  renderFilterButtons();
  renderTodoList();
}

function renderDateBar() {
  const today = formatDate(new Date());
  $selectedDateLabel.textContent = formatDateLabel(selectedDate);
  $goTodayButton.hidden = selectedDate === today;

  $dateToggleButton.setAttribute("aria-expanded", String(isCalendarOpen));
  $dateBar.classList.toggle("is-calendar-open", isCalendarOpen);
}

// 달력: 닫혀 있으면 자식 렌더는 건너뛰고 hidden 만 토글
function renderCalendar() {
  $calendarPopover.hidden = !isCalendarOpen;
  if (!isCalendarOpen) return;

  const today = formatDate(new Date());
  $calendarMonthLabel.textContent = formatMonthLabel(calendarAnchor);

  const grid = getCalendarGrid(calendarAnchor);
  $calendarDays.innerHTML = "";
  grid.forEach((cell) => {
    $calendarDays.appendChild(createCalendarDayElement(cell, today));
  });
}

function createCalendarDayElement({ date, isCurrentMonth }, todayString) {
  const $item = document.createElement("li");
  $item.className = "calendar__day";
  $item.dataset.date = date;
  $item.setAttribute("role", "button");
  $item.setAttribute("tabindex", "0");
  $item.setAttribute("aria-label", formatDateLabel(date));

  if (!isCurrentMonth) $item.classList.add("is-other-month");
  if (date === todayString) $item.classList.add("is-today");
  if (date === selectedDate) $item.classList.add("is-selected");

  const { total } = countTodosByDate(date);
  if (total > 0) $item.classList.add("has-todos");

  $item.textContent = String(parseDate(date).getDate());
  return $item;
}

function renderWeekView() {
  const today = formatDate(new Date());
  const weekDates = getWeekDates(selectedDate);

  $weekList.innerHTML = "";
  weekDates.forEach((dateString, index) => {
    $weekList.appendChild(createWeekDayElement(dateString, index, today));
  });
}

function createWeekDayElement(dateString, weekdayIndex, todayString) {
  const $item = document.createElement("li");
  $item.className = "week-view__day";
  $item.dataset.date = dateString;
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
  const { total, completed } = countTodosByDate(dateString);
  if (total === 0) {
    $count.textContent = "";
  } else {
    $count.textContent = `${completed}/${total}`;
    if (completed === total) $count.classList.add("is-all-done");
  }

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

  const $checkbox = document.createElement("input");
  $checkbox.type = "checkbox";
  $checkbox.className = "todo-list__checkbox";
  $checkbox.checked = todo.completed;
  $checkbox.dataset.action = "toggle";
  $checkbox.setAttribute(
    "aria-label",
    todo.completed ? "완료 취소" : "완료 처리"
  );

  const $text = document.createElement("span");
  $text.className = "todo-list__text";
  $text.textContent = todo.text;

  const $editButton = document.createElement("button");
  $editButton.type = "button";
  $editButton.className = "todo-list__action";
  $editButton.dataset.action = "edit";
  $editButton.textContent = "수정";

  const $deleteButton = document.createElement("button");
  $deleteButton.type = "button";
  $deleteButton.className = "todo-list__action is-danger";
  $deleteButton.dataset.action = "delete";
  $deleteButton.textContent = "삭제";

  $item.append($checkbox, $text, $editButton, $deleteButton);
  return $item;
}

/* ===== 이벤트 바인딩 ===== */
$form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo($input.value);
});

$input.addEventListener("input", () => {
  if ($message.textContent) $message.textContent = "";
});

$list.addEventListener("click", (event) => {
  const $actor = event.target.closest("[data-action]");
  if (!$actor) return;

  const $item = $actor.closest(".todo-list__item");
  if (!$item) return;

  const id = Number($item.dataset.id);
  const action = $actor.dataset.action;

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
$goTodayButton.addEventListener("click", goToToday);

// 주차 이동
$prevWeekButton.addEventListener("click", () => shiftSelectedDay(-7));
$nextWeekButton.addEventListener("click", () => shiftSelectedDay(7));

// 주간 뷰 셀
$weekList.addEventListener("click", (event) => {
  const $day = event.target.closest(".week-view__day");
  if (!$day) return;
  setSelectedDate($day.dataset.date);
});
$weekList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const $day = event.target.closest(".week-view__day");
  if (!$day) return;
  event.preventDefault();
  setSelectedDate($day.dataset.date);
});

/* 달력 이벤트 */
$dateToggleButton.addEventListener("click", toggleCalendar);
$prevMonthButton.addEventListener("click", () => shiftCalendarMonth(-1));
$nextMonthButton.addEventListener("click", () => shiftCalendarMonth(1));

$calendarDays.addEventListener("click", (event) => {
  const $day = event.target.closest(".calendar__day");
  if (!$day) return;
  selectDateFromCalendar($day.dataset.date);
});
$calendarDays.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const $day = event.target.closest(".calendar__day");
  if (!$day) return;
  event.preventDefault();
  selectDateFromCalendar($day.dataset.date);
});

// 바깥 클릭으로 달력 닫기
//   달력은 .date-bar 내부에 있으므로, .date-bar 바깥 클릭이면 닫는다.
document.addEventListener("click", (event) => {
  if (!isCalendarOpen) return;
  if (event.target.closest(".date-bar")) return;
  closeCalendar();
});

// Esc 로 달력 닫기
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!isCalendarOpen) return;
  closeCalendar();
});

/* ===== 초기 렌더 ===== */
render();
