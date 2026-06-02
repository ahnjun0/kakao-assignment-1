# VanillaJS Todo App

## 프로젝트 소개

VanillaJS만 사용하여 구현한 Todo 앱입니다. 카카오테크캠퍼스 1차 과제 제출물입니다.

## 사용 기술

- HTML
- CSS (커스텀 프로퍼티)
- Vanilla JavaScript
- Web Storage API (localStorage)

## 폴더 구조

```
todo-vanilla/
├── index.html   # 마크업 구조
├── style.css    # 스타일 (메인 컬러 #672be0)
├── app.js       # 상태 관리, 렌더, 이벤트
└── README.md
```

## 주요 기능

- [ ] Todo 생성 / 조회 / 수정 / 완료 / 삭제 (CRUD)
- [ ] 상태별 필터링 (전체 / 진행 중 / 완료)
- [ ] 날짜별 Todo 관리 (일간 뷰)
- [ ] localStorage 영속화
- [ ] (도전) 주간 뷰

## 실행 방법

VSCode Live Server 등 정적 서버로 `todo-vanilla/index.html` 을 연다.
`file://` 로 직접 여는 방식은 일부 환경에서 동작이 다를 수 있다.

## 설계 메모

- 상태(`todos`, `selectedDate`, `currentFilter`)는 `app.js` 상단에서 한 곳으로 관리한다.
- 상태 변경 후 `render()` 한 번으로 화면을 다시 그린다. (React 전환을 염두에 둔 단방향 흐름)
- 순수 함수(`formatDate`, `getVisibleTodos`)와 DOM 조작을 분리한다.
- 리스트 클릭은 이벤트 위임(`$list.addEventListener`)으로 처리한다.

## 구현하면서 어려웠던 점

-

## AI 활용 내용

-

## 직접 수정한 부분

-

## 배운 점

-
