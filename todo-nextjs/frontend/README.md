# 3차 과제 — Next.js + FastAPI Todo

2차 과제(React + Vite)에서 만든 Todo 앱을 **Next.js App Router(프론트) + FastAPI(백)** 풀스택 구조로 다시 만들었다. 로컬스토리지 단방향 데이터 흐름이 클라이언트 ↔ 서버 왕복 흐름으로 바뀌었다.

> 이 README는 `todo-nextjs/frontend/` 디렉토리 기준이다. 백엔드는 `../backend/`에 있다.

---

## 폴더 구조

```
todo-nextjs/
├── frontend/                       # Next.js (App Router, TypeScript, Tailwind v4)
│   ├── app/
│   │   ├── api/todos/route.ts      # FastAPI 프록시 (도전 미션에서 ?filter, ?search 위임)
│   │   ├── todos/
│   │   │   ├── _components/        # FilterTabs, SearchBar, TodoForm, TodoItem (모두 Client)
│   │   │   ├── [todoId]/page.tsx   # 수정 페이지 (Server에서 단건 fetch)
│   │   │   ├── new/page.tsx        # 생성 페이지 (Server, TodoForm만 Client)
│   │   │   ├── error.tsx           # /todos 하위 에러 fallback (Client 강제)
│   │   │   ├── loading.tsx         # /todos 하위 로딩 fallback
│   │   │   └── page.tsx            # 목록 페이지 (Server, FastAPI 직접 fetch)
│   │   ├── actions.ts              # Server Actions — CRUD mutation
│   │   ├── lib/api.ts              # Todo 타입, BACKEND_URL, fetch 헬퍼
│   │   ├── layout.tsx
│   │   ├── page.tsx                # 루트(/) → /todos 안내
│   │   └── globals.css             # Tailwind + #672be0 토큰
│   ├── .env.local.example          # 환경변수 예시 (복사 후 .env.local로)
│   └── README.md (이 파일)
└── backend/
    ├── main.py                     # FastAPI + SQLAlchemy + Pydantic 단일 파일
    ├── requirements.txt
    └── .env.local.example
```

---

## 실행 방법

### 1. 환경변수 준비

```bash
cp todo-nextjs/frontend/.env.local.example todo-nextjs/frontend/.env.local
cp todo-nextjs/backend/.env.local.example todo-nextjs/backend/.env.local
```

### 2. 백엔드 실행

```bash
cd todo-nextjs/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload    # http://localhost:8000 (Swagger: /docs)
```

### 3. 프론트엔드 실행 (별도 터미널)

```bash
cd todo-nextjs/frontend
npm install
npm run dev                  # http://localhost:3000
```

---

## 구현한 기능

### 필수 미션

- [x] 미션 0: 디렉토리 구조 잡기 (`frontend/` + `backend/` 분리)
- [x] 미션 1: 프론트엔드 세팅 (Next.js 16, TS strict, Tailwind v4, App Router)
- [x] 미션 2: 백엔드 세팅 (venv + FastAPI Hello World)
- [x] 미션 3: FastAPI Todo CRUD API (SQLAlchemy + Pydantic + CORS, 4개 엔드포인트 + 404 처리)
- [x] 미션 4: Next.js Todo 페이지 5개 (목록/생성/수정/loading/error, Server·Client 분리)
- [x] 미션 5: `route.ts` 프록시 + `actions.ts` Server Action 작성, 프론트-백엔드 연동
- [x] 미션 6: 환경변수 분리 (`BACKEND_URL`, `DATABASE_URL`, fallback 제거)

### 도전 미션

- [x] 도전 1: 서버 기반 상태 필터링 (URL `?filter=` + FastAPI Literal 쿼리)
- [x] 도전 2: 서버 기반 검색 + 300ms 디바운스 (URL `?search=` + FastAPI ilike, filter와 동시 적용 가능)

### 2차 연속성 추가 작업

- [x] **일간 뷰 (2차 미션 4 이식)**: `Todo.date` 컬럼 추가, 날짜 헤더(이전/오늘/다음), URL `?date=YYYY-MM-DD` 동기화, 생성 시 현재 보고 있는 날짜에 자동 귀속. `date` / `filter` / `search`가 모두 동시 적용 가능.
- [x] **주간 뷰 (2차 도전 이식)**: 월~일 7칸, 각 날짜 아래 Todo 개수, 오늘/선택일 강조, 이전 주/다음 주 이동. 카운트는 백엔드의 새 엔드포인트 `GET /todos/counts?from=...&to=...`에서 SQLAlchemy `group_by`로 집계.

---

## Server / Client Component 구분

| 파일 | 종류 | 이유 |
|---|---|---|
| `app/page.tsx` | Server | `/todos`로 즉시 redirect만 수행 |
| `app/todos/page.tsx` | Server | FastAPI를 서버에서 직접 fetch, searchParams로 서버 측 필터링 |
| `app/todos/new/page.tsx` | Server | `TodoForm`(Client)만 렌더 |
| `app/todos/[todoId]/page.tsx` | Server | 단건 데이터를 서버에서 패치 후 폼에 props |
| `app/todos/loading.tsx` | Server | 로딩 fallback (정적) |
| `app/todos/error.tsx` | **Client** | App Router 규약 — `reset` 인터랙션 |
| `_components/TodoItem.tsx` | **Client** | 체크박스/삭제 onClick, useTransition |
| `_components/TodoForm.tsx` | **Client** | useState 입력 / submit / useRouter |
| `_components/FilterTabs.tsx` | **Client** | useSearchParams, useRouter, 탭 onClick |
| `_components/SearchBar.tsx` | **Client** | useState + useEffect 디바운스, useSearchParams |
| `_components/DateHeader.tsx` | **Client** | 이전/오늘/다음 onClick, useSearchParams/useRouter |
| `_components/WeekView.tsx` | **Client** | 7칸 onClick, 주차 이동 onClick, useSearchParams/useRouter |

## `route.ts` vs `actions.ts`

- **`actions.ts` (Server Action)**: Client Component가 함수처럼 직접 import해서 부른다. 호출 후 `revalidatePath`로 Server Component 캐시를 무효화한다. CRUD mutation 전부 여기를 거친다.
- **`route.ts` (API Route)**: 외부에서 HTTP로 들어오는 `fetch('/api/todos')`를 받아 FastAPI에 위임하는 프록시. `?filter=`, `?search=` 등 search params를 그대로 forward한다.

두 방식 모두 결국 FastAPI를 부르지만, **어디서 호출되느냐**가 다르다.

---

## 회고

### 좋았던 점

- Server Component가 기본이라는 사고에 익숙해지자, `"use client"`가 필요한 지점이 *기능*(useState/onClick 등)로 명확해졌다.
- URL search params를 상태 저장소로 쓰니 새로고침·뒤로가기·공유에 자연스럽게 대응됐다. 2차의 `useState` 필터와 본질적으로 다른 발상이었다.
- `route.ts` vs `actions.ts`를 한 번 헷갈렸지만, "외부 HTTP 진입점이냐, 컴포넌트가 직접 부르는 함수냐"로 정리되니 더는 헷갈리지 않았다.

### 어려웠던 점

- Next 16에서 `searchParams`가 `Promise`로 바뀐 점을 처음에 잊고 빌드 에러를 봤다.
- `useSearchParams`를 쓰는 컴포넌트는 `Suspense`로 감싸야 한다는 권장을 마지막에 알아 한 번 더 수정했다.
- Server Component에서 Client로 *함수*를 props로 넘기지 못하는 제약 때문에 `actions.ts`를 Client 안에서 직접 import하는 패턴을 처음 써봤다.

### 다음에 시도해보고 싶은 것

- 달력 팝오버로 임의 날짜 점프 (2차 QoL)
- 낙관적 업데이트(`useOptimistic`)로 토글 반응성 끌어올리기
- 다크 모드, 정렬 등 2차 QoL 이식

---

## 참고: Next 16 메모

- `create-next-app`의 "Turbopack: No" 옵션이 더 이상 노출되지 않는다 (16부터 빌드/dev 기본이 Turbopack). 가이드 옵션 표와 미세하게 다른 부분.
- `params`, `searchParams`가 모두 `Promise`로 변경되었다 — 페이지에서 `await`로 풀어 써야 한다.
