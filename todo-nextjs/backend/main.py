"""
3차 과제 백엔드 진입점.

미션 2 단계에서는 FastAPI가 동작하는지만 확인하기 위해 루트(`/`)에
Hello World 응답만 둔다. CRUD 모델·스키마·라우터는 미션 3에서 채운다.
"""

from fastapi import FastAPI

app = FastAPI(title="Todo API", version="0.1.0")


@app.get("/")
def root():
    # 헬스 체크용. 미션 2 확인 포인트: localhost:8000 접속 시 JSON 응답.
    return {"message": "Hello World"}
