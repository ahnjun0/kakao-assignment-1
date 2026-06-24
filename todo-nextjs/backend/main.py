"""
3차 과제 백엔드 진입점 (FastAPI + SQLAlchemy + Pydantic).

이 파일 하나에서 다음을 모두 처리한다.
- 데이터베이스 설정 (SQLite, SQLAlchemy 2 스타일)
- ORM 모델 (`Todo`)
- 요청/응답 스키마 (`TodoCreate`, `TodoUpdate`, `TodoOut`)
- CORS 미들웨어 (Next.js dev 서버가 직접 호출하는 경우 대비)
- DB 세션 의존성 (`get_db`)
- CRUD 엔드포인트 (GET / POST / PUT / DELETE) + 일간 뷰용 date 필터
"""

import os
import re
from datetime import date as date_type
from datetime import datetime, timezone
from typing import Generator, Literal

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine, func
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# ---------------------------------------------------------------------------
# 1. DB 설정
# ---------------------------------------------------------------------------

load_dotenv(".env.local")

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL 환경변수가 설정되지 않았습니다. .env.local을 확인해주세요."
    )

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """SQLAlchemy 2.x 스타일 베이스 클래스."""


# ---------------------------------------------------------------------------
# 2. ORM 모델
# ---------------------------------------------------------------------------


class Todo(Base):
    """Todo 한 건. date(YYYY-MM-DD)로 일간 뷰에 귀속된다."""

    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, nullable=False, default=False)
    # 사용자가 선택한 '귀속 날짜'. YYYY-MM-DD 문자열로 저장.
    # 인덱스를 두는 이유: 일간 뷰가 date 필터를 매번 건다.
    date = Column(String, nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# 3. Pydantic 스키마
# ---------------------------------------------------------------------------

# YYYY-MM-DD 형식만 허용한다. 잘못된 형식은 Pydantic 단계에서 차단.
DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"
_date_regex = re.compile(DATE_PATTERN)


def _today_str() -> str:
    """서버 로컬 기준 오늘 날짜. (UTC 변환을 피하기 위해 datetime.now().date() 사용)"""
    return datetime.now().date().isoformat()


class TodoCreate(BaseModel):
    """POST /todos 요청 본문. date를 안 주면 서버가 오늘 날짜로 채운다."""

    title: str = Field(min_length=1, max_length=200)
    date: str | None = Field(default=None, pattern=DATE_PATTERN)


class TodoUpdate(BaseModel):
    """PUT /todos/{id} 요청 본문. 모든 필드 선택적."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    completed: bool | None = None
    date: str | None = Field(default=None, pattern=DATE_PATTERN)


class TodoOut(BaseModel):
    id: int
    title: str
    completed: bool
    date: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TodoCount(BaseModel):
    """`GET /todos/counts` 응답 항목 (주간 뷰용 날짜별 개수)."""

    date: str
    count: int


# ---------------------------------------------------------------------------
# 4. FastAPI 앱 + CORS
# ---------------------------------------------------------------------------

app = FastAPI(title="Todo API", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# 5. DB 세션 의존성
# ---------------------------------------------------------------------------


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# 6. CRUD 엔드포인트
# ---------------------------------------------------------------------------


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Hello World"}


@app.get("/todos", response_model=list[TodoOut])
def list_todos(
    db: Session = Depends(get_db),
    filter: Literal["all", "active", "completed"] = Query(default="all"),
    search: str | None = Query(default=None),
    date: str | None = Query(default=None, pattern=DATE_PATTERN),
) -> list[Todo]:
    """
    Todo 목록을 created_at 오름차순으로 반환한다.

    서버 측에서 직접 필터링한다:
    - `date` (일간 뷰): YYYY-MM-DD. 해당 날짜에 귀속된 Todo만.
    - `filter` (도전 1): all / active / completed
    - `search` (도전 2): title ilike 부분 일치
    세 조건은 동시에 적용 가능 (예: ?date=2026-06-24&filter=active&search=보고서).
    """
    query = db.query(Todo)

    if date:
        query = query.filter(Todo.date == date)

    if filter == "active":
        query = query.filter(Todo.completed.is_(False))
    elif filter == "completed":
        query = query.filter(Todo.completed.is_(True))

    if search:
        query = query.filter(Todo.title.ilike(f"%{search}%"))

    return query.order_by(Todo.created_at.asc()).all()


@app.get("/todos/counts", response_model=list[TodoCount])
def todo_counts(
    db: Session = Depends(get_db),
    # `from`은 Python 예약어라 함수 파라미터명은 `from_`을 쓰고 alias로 매핑한다.
    from_: str = Query(..., alias="from", pattern=DATE_PATTERN),
    to: str = Query(..., pattern=DATE_PATTERN),
) -> list[TodoCount]:
    """
    [from, to] 범위(양 끝 포함) 안의 날짜별 Todo 개수를 반환한다 (주간 뷰).
    개수가 0인 날짜는 응답에 포함되지 않으므로, 클라이언트가 7일을 표시할 때
    빠진 날짜는 0으로 채워야 한다.
    """
    rows = (
        db.query(Todo.date, func.count(Todo.id))
        .filter(Todo.date >= from_, Todo.date <= to)
        .group_by(Todo.date)
        .all()
    )
    return [TodoCount(date=date, count=count) for date, count in rows]


@app.post("/todos", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate, db: Session = Depends(get_db)) -> Todo:
    """새 Todo를 만든다. date가 비어 있으면 서버 오늘 날짜로 채운다."""
    todo = Todo(
        title=payload.title.strip(),
        completed=False,
        date=payload.date or _today_str(),
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@app.put("/todos/{todo_id}", response_model=TodoOut)
def update_todo(
    todo_id: int,
    payload: TodoUpdate,
    db: Session = Depends(get_db),
) -> Todo:
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    if payload.title is not None:
        todo.title = payload.title.strip()
    if payload.completed is not None:
        todo.completed = payload.completed
    if payload.date is not None:
        todo.date = payload.date

    db.commit()
    db.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)) -> None:
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(todo)
    db.commit()
