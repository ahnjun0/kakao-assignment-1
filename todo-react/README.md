# React Todo App

## 프로젝트 소개

1차의 VanillaJS Todo 앱을 React Function Component 구조로 옮긴 카카오테크캠퍼스 2차 과제 제출물입니다. 상태 관리/단방향 흐름/컴포넌트 단위 책임 분리를 React 방식으로 다시 한 번 정리하는 데 초점을 뒀습니다.

## 사용 기술

- React 18 (Function Component, Hooks)
- Vite 5 (개발 서버 / 번들러)
- Tailwind CSS v4 (`@tailwindcss/vite` 플러그인 + `@theme` 디자인 토큰)
- JavaScript
- Web Storage API (localStorage)

## 폴더 구조

```
todo-react/
├── index.html              # 진입 HTML + 다크 모드 FOUC 방지 부트스트랩
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css           # @import "tailwindcss" + @theme 디자인 토큰 + 다크 모드 토큰
│   ├── components/
│   │   ├── TodoApp.jsx     # 모든 상태(todos/selectedDate/currentFilter/weekStartDate/theme)와 핸들러의 단일 출처
│   │   ├── DateHeader.jsx  # 날짜 표시 + 이전/다음 + "오늘로" + 달력 토글
│   │   ├── WeekView.jsx    # 월~일 7칸 + 날짜별 '완료/전체' 카운트 + 주차 이동
│   │   ├── Calendar.jsx    # 달력 팝오버 (외부 클릭/Esc 닫기, triggerRef 패턴)
│   │   ├── TodoInput.jsx   # 입력창 + 추가 버튼 + 빈 입력 가드
│   │   ├── FilterTabs.jsx  # 전체 / 진행 중 / 완료 탭
│   │   ├── TodoList.jsx    # 목록 렌더링 + 빈 상태 메시지(prop으로 받음)
│   │   ├── TodoItem.jsx    # 체크/수정/삭제 + 인라인 수정 상태(로컬)
│   │   └── ThemeToggle.jsx # 라이트/다크 토글 버튼
│   └── utils/
│       └── date.js         # formatDate / addDays / formatKoreanDate / getWeekStart / addMonths 등 순수 함수
└── README.md
```

## 주요 기능

- [X] Todo 생성 / 조회 / 수정 / 완료 / 삭제 (CRUD)
- [X] 상태별 필터링 (전체 / 진행 중 / 완료)
- [X] 날짜별 Todo 관리 (일간 뷰)
- [X] localStorage 영속화 (`useState` 함수형 초기화 + `useEffect` 자동 저장)
- [X] (도전) 주간 뷰 — 월~일 그리드 + 날짜별 `완료/전체` 카운트
- [X] 달력 팝오버로 자유 날짜 이동 (외부 클릭/Esc 자동 닫힘)
- [X] "오늘로" 버튼 (오늘이 아닐 때만 노출, 주간 뷰도 동시 추종)
- [X] 완료 항목 자동 하단 정렬 (안정 정렬 활용)
- [X] 다크 모드 (시스템 설정 자동 감지 + 수동 토글 + FOUC 방지)
- [X] 인라인 수정 (더블클릭/수정 버튼 → Enter·확인 버튼 저장 / Esc 취소 / blur 자동 저장)

## 실행 방법

```bash
cd todo-react
npm install
npm run dev   # http://localhost:5173
```

빌드:

```bash
npm run build
```

## 설계 메모

- **상태 단일 출처**: `todos / selectedDate / currentFilter / weekStartDate / theme` 다섯 가지를 모두 `TodoApp` 에서만 들고 있고, 자식은 props 와 콜백으로만 변경을 요청한다 (단방향).
- **state co-location**: 입력 중 텍스트(`TodoInput`), 인라인 수정 여부(`TodoItem`), 달력 열림 상태와 표시 중인 달(`DateHeader`/`Calendar`)처럼 *그 컴포넌트만 쓰는 값* 은 그 자리에 로컬 `useState` 로 둔다.
- **파생값은 렌더 본문에서 계산**: `visibleTodos`, `formatKoreanDate(selectedDate)`, 주간 뷰의 날짜별 카운트는 `useEffect` 가 아니라 렌더 시 즉시 계산한다. effect 는 외부 동기화(localStorage / `<html data-theme>`) 전용.
- **함수형 초기화**: `useState(loadTodos)` 처럼 함수 *참조* 를 넘겨 마운트 시 한 번만 localStorage 를 읽는다.
- **불변 업데이트**: `setTodos` 호출은 모두 `map` / `filter` / `[...current, x]` 로 새 배열을 만든다.
- **`key` 는 안정된 id**: 모든 리스트에서 `todo.id`, `filter.key`, `dateString` 등 안정된 값을 사용 (index 금지).
- **DOM 직접 조작은 좁게**: 달력 팝오버 외부 클릭 감지는 React 만으로 표현하기 어려운 명령형 동작이라 `useRef` + `useEffect` 로 한정한다.
- **디자인 토큰 일원화**: `@theme` 에 `--color-primary` 등 토큰을 등록하면 `bg-primary`, `text-muted` 같은 유틸리티가 자동 생성된다. 다크 모드는 `[data-theme="dark"]` 셀렉터에서 같은 변수만 덮어써 모든 유틸리티가 자동으로 다크 색을 쓰도록 했다 — 컴포넌트에 `dark:` 변형을 적지 않아도 동작한다.

## 구현하면서 어려웠던 점

- **CSS 주석 안의 `*/` 가 `@theme` 블록을 깨뜨린 버그**: 1차 디자인 토큰을 이식했는데 화면에 보라색 한 점이 안 나왔다. 원인을 추적해보니 `@theme` 위에 적은 설명 주석에 `bg-*/text-*` 라는 표기를 썼고, 그 한가운데의 `*/` 가 CSS 주석을 *조기 종료* 시켜 그 뒤 `@theme { ... }` 가 통째로 파싱되지 않았다. dev 서버가 생성한 CSS 를 `curl` 로 직접 뜯어보고서야 발견했다. 주석 표기를 `bg-foo, text-foo` 로 바꿔 해결.
- **달력 토글이 닫히지 않던 이벤트 순서 문제**: 토글 버튼을 클릭하면 `mousedown` 단계에서 Calendar 의 외부 클릭 리스너가 발화해 닫기를 호출하고, 이어진 `click` 에서 토글 핸들러가 다시 열기를 호출해 결과적으로 절대 닫히지 않았다. 토글 버튼의 `ref` 를 Calendar 에 `triggerRef` 로 전달해, 그 영역 위 클릭은 "외부 클릭" 으로 보지 않도록 가드해서 해결. Material UI / Radix 같은 라이브러리도 같은 패턴(anchorRef)을 쓴다는 걸 알게 됐다.
- **인라인 수정 확인 버튼이 무시되던 문제**: input 의 `onBlur` 가 button 의 `click` 보다 먼저 발화해 commit 이 두 번 일어나거나 클릭이 잘렸다. 확인 버튼을 `onMouseDown` 단계로 옮기고 `event.preventDefault()` 로 blur 를 막아 해결.
- **`weekStartDate` 를 독립 state 로 둘지 파생으로 둘지**: 1차는 `selectedDate` 를 진실의 출처로 두고 주(週)는 매번 계산해서 동기화 버그를 원천 차단했다. 2차 과제 요구사항이 `weekStartDate` 를 별도 `useState` 로 관리하도록 명시되어 있어 독립 state 로 분리했다. 대신 일간 ◀▶ 이동이 주 범위를 벗어나면 `ensureWeekContains` 한 줄로 주간 뷰가 따라가도록 했다. effect 로 동기화하지 않고 핸들러에서 즉시 처리한 것이 핵심.
- **다크 모드 FOUC 와 React state 의 두 채널 동기화**: `<head>` 인라인 스크립트가 `<html data-theme>` 을 먼저 세팅하고, 그 뒤에 React 가 마운트되며 `loadTheme()` 으로 DOM 에서 값을 다시 읽어 state 와 맞춘다. 두 채널이 어긋나면 토글 버튼 아이콘과 실제 톤이 안 맞는 사태가 생기기 때문에 한쪽이 진실의 출처(=DOM)가 되도록 명확히 정리했다.
- **`useEffect` 의 함정**: 초안에서 `visibleTodos` 를 `useEffect` 로 만들고 싶은 유혹이 있었는데, 그러면 렌더 한 박자 뒤에 반영되고 추가 state 가 늘어나 진실의 출처가 모호해진다. "파생값은 effect 가 아니라 렌더 본문" 이라는 React 원칙을 그대로 받아들이는 게 가장 안전했다.

## AI 활용 내용

- 1차 결과물을 React 로 옮기는 작업이라 큰 흐름은 익숙했지만, 컴포넌트 분리와 props/state 책임 경계를 잡는 단계마다 AI 와 트레이드오프를 같이 검토했다. 예: `weekStartDate` 를 독립 state 로 둘지 파생으로 둘지, `TodoList` 가 filter 개념을 알지 모를지 등.
- 미션 단위(2 → 3 → 4 → 5 → 도전)로 끊어 진행하면서 각 단계의 검증 포인트(브라우저에서 어떤 동작이 보여야 하는지)를 AI 와 명시적으로 합의하고 넘어갔다.
- 에러나 의도와 다른 동작이 있을 때 AI 에게 코드와 증상을 같이 전달해 원인 분석을 요청했다. 위 "어려웠던 점" 의 CSS 주석 버그와 달력 토글 버그는 둘 다 이 방식으로 잡았다.
- Tailwind v4 의 `@theme` 토큰 시스템처럼 처음 보는 API 는 AI 에게 "v3 와 무엇이 다른지" 차이점 위주로 짧게 정리받아 시간을 절약했다.

## 직접 수정한 부분

- **`weekStartDate` 를 독립 state 로 두기로 한 설계 변경**: 1차의 파생값 방식이 더 단순했지만, 과제 요구사항을 그대로 받아들이는 대신 `ensureWeekContains` 라는 작은 안전장치를 핸들러 안에 직접 만들어 일간 뷰와 주간 뷰의 일관성이 깨지지 않도록 했다.
- **달력 팝오버에 `triggerRef` prop 패턴을 도입한 결정**: 단순히 외부 클릭 감지만 하면 토글 버튼과 충돌하는데, 라이브러리에서 본 anchor 패턴을 응용해 토글 버튼 ref 를 prop 으로 넘기는 구조로 직접 정리했다. 라이브러리 추가 없이 같은 결과를 얻는 게 목표였다.
- **인라인 수정 확인 버튼을 `onMouseDown` 으로 처리한 결정**: 일관성보다 동작의 정확함을 택했다. blur 와 click 사이의 경쟁 조건이라 어쩔 수 없다는 판단을 직접 하고, 그 이유를 코드 주석으로 남겼다.
- **빈 상태 메시지를 `TodoList` 에 prop 으로 내려주는 구조**: `TodoList` 가 filter 개념을 모르게 분리하고 싶어, "왜 비었는지" 는 `TodoApp` 이 알고 `TodoList` 는 받은 문구만 표시하도록 책임을 직접 잘랐다.
- **다크 모드를 Tailwind v4 의 `dark:` 변형 없이 토큰 덮어쓰기 한 줄로 구현한 선택**: 컴포넌트마다 `dark:bg-...` 를 적으면 일관성이 깨지기 쉽다. `[data-theme="dark"]` 셀렉터에서 `--color-*` 만 갈아끼우면 모든 유틸리티가 자동으로 다크 색을 쓴다는 점을 활용했다. 1차의 토큰 덮어쓰기 방식과 정확히 같은 구조라 학습 연속성도 좋았다.
- **달력 셀의 오늘 강조 시인성 조정**: 초안에서는 today 셀에 보라 테두리만 둬서 흰 배경에서 글자 시인성이 약했다. `text-primary font-semibold` 를 추가해 테두리와 글자가 같이 강조되도록 직접 바꿨다.

## 배운 점

- **React 의 단방향 흐름은 1차의 `render()` 와 같은 모델**: state 변경 → 화면 전체 재렌더링이라는 점에서 동일하다. 다만 React 는 그 사이를 가상 DOM 으로 효율화해주고, 컴포넌트 단위로 책임을 잘라 둘 수 있어서 코드 양이 늘어도 인지 비용은 오히려 줄었다.
- **`useState` 와 `useEffect` 의 역할 분리**: state 는 UI 상태, effect 는 *외부 동기화* (localStorage / DOM / 타이머). 파생값(filtered list, formatted string)은 effect 가 아니라 렌더 본문에서 매번 계산하는 게 React 방식의 정석이라는 걸 손에 익혔다.
- **lifting state up & state co-location**: 두 컴포넌트가 공유하는 값은 공통 부모로 끌어올리고, 한 컴포넌트만 쓰는 값은 그 자리에 두는 단순한 규칙이 컴포넌트 트리의 모양을 자연스럽게 결정한다.
- **`key` 와 안정된 id**: index 를 key 로 쓰면 정렬/삭제 시 React 가 잘못된 컴포넌트 인스턴스를 재사용한다. 1차에서 `data-id` 로 markup 에 의도를 담던 습관이 `crypto.randomUUID()` + `key={todo.id}` 로 자연스럽게 이어졌다.
- **React 에서 명령형 DOM 조작이 정당화되는 좁은 영역**: 포커스 / 외부 클릭 / 스크롤처럼 선언적 모델로 표현할 수 없는 동작에 한해 `useRef + useEffect` 가 정답이다. 우회로 쓰지 말고 정공법으로 쓰는 게 핵심.
- **Tailwind v4 의 토큰 시스템과 디자인 시스템의 결합**: `@theme` 에 변수를 등록하면 유틸리티가 자동 생성되고, 셀렉터로 변수만 덮어쓰면 다크 모드가 *공짜로* 완성된다. CSS 변수의 cascade 와 utility-first CSS 가 만나는 지점의 우아함을 느꼈다.
- **AI 와의 협업 패턴이 더 정교해졌다**: 단순히 코드를 받는 것이 아니라, *설계 트레이드오프를 같이 짚어달라* / *에러 증상과 코드를 같이 분석해달라* / *생성된 결과물(CSS, DOM)을 같이 검증하자* 같은 방식이 가장 결과가 좋았다. CSS 주석 버그를 잡은 것도 이 방식 덕분이었다.
