"""
3차 과제 백엔드 진입점 (FastAPI + SQLAlchemy + Pydantic).

이 파일 하나에서 다음을 모두 처리한다.
- 데이터베이스 설정 (SQLite, SQLAlchemy 2 스타일)
- ORM 모델 (`Todo`)
- 요청/응답 스키마 (`TodoCreate`, `TodoUpdate`, `TodoOut`)
- CORS 미들웨어 (Next.js dev 서버가 직접 호출하는 경우 대비)
- DB 세션 의존성 (`get_db`)
- CRUD 엔드포인트 (GET / POST / PUT / DELETE)

가이드 권장대로 단일 파일에 담는다. 미션 6에서 DATABASE_URL을 .env.local로 분리.
"""

from datetime import datetime, timezone
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# ---------------------------------------------------------------------------
# 1. DB 설정
# ---------------------------------------------------------------------------

# SQLite 파일 경로. 미션 6에서 환경변수(DATABASE_URL)로 분리할 예정이라
# 일단 상수로 둔다. check_same_thread=False는 SQLite + FastAPI 조합 권장.
DATABASE_URL = "sqlite:///./todos.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# 세션 팩토리: 요청마다 한 번씩 생성/종료한다 (get_db 참고).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """SQLAlchemy 2.x 스타일 베이스 클래스."""


# ---------------------------------------------------------------------------
# 2. ORM 모델
# ---------------------------------------------------------------------------


class Todo(Base):
    """Todo 한 건을 표현하는 테이블."""

    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, nullable=False, default=False)
    # 정렬용. 클라이언트가 직접 만지지 않고 서버가 자동 기록한다.
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


# 앱 시작 시 테이블이 없으면 생성한다. 학습 과제 규모라 마이그레이션 도구 없이 충분.
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# 3. Pydantic 스키마 (요청/응답)
# ---------------------------------------------------------------------------


class TodoCreate(BaseModel):
    """POST /todos 요청 본문."""

    title: str = Field(min_length=1, max_length=200)


class TodoUpdate(BaseModel):
    """PUT /todos/{id} 요청 본문. 두 필드 모두 선택적으로 보낼 수 있다."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    completed: bool | None = None


class TodoOut(BaseModel):
    """모든 응답에서 공통으로 쓰는 출력 스키마."""

    id: int
    title: str
    completed: bool
    created_at: datetime

    # ORM 인스턴스를 그대로 직렬화하기 위한 설정 (Pydantic v2).
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# 4. FastAPI 앱 + CORS
# ---------------------------------------------------------------------------

app = FastAPI(title="Todo API", version="0.2.0")

# Next.js 클라이언트 컴포넌트가 직접 호출하는 경우(브라우저 → FastAPI)를 대비.
# 일반 흐름은 Next.js route.ts 프록시를 거치지만, 안전망으로 명시적으로 허용한다.
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
    """
    요청 단위로 SQLAlchemy 세션을 열고, 응답이 끝나면 닫는다.
    FastAPI의 Depends를 통해 각 엔드포인트에 주입된다.
    """
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
    """간단한 헬스 체크. 미션 2 때 만든 응답을 유지한다."""
    return {"message": "Hello World"}


@app.get("/todos", response_model=list[TodoOut])
def list_todos(db: Session = Depends(get_db)) -> list[Todo]:
    """전체 Todo 목록을 created_at 오름차순으로 반환한다."""
    return db.query(Todo).order_by(Todo.created_at.asc()).all()


@app.post("/todos", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate, db: Session = Depends(get_db)) -> Todo:
    """새 Todo를 만든다. title은 Pydantic 단계에서 빈 문자열을 거른다."""
    todo = Todo(title=payload.title.strip(), completed=False)
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
    """Todo의 title 또는 completed를 부분 수정한다."""
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    if payload.title is not None:
        todo.title = payload.title.strip()
    if payload.completed is not None:
        todo.completed = payload.completed

    db.commit()
    db.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)) -> None:
    """Todo를 삭제한다. 없는 id면 404."""
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(todo)
    db.commit()
