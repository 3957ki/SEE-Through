# 🍽️ FastAPI 기반 냉장고 & 식단 관리 API

## 🚀 실행 방법
### 1. 가상 환경 생성
```
py -3.10 -m venv venv
```
### 2. 가상 환경 활성화 & 패키지 설치
- Windows (PowerShell)
```
# 가상 환경 활성화
.\venv\Scripts\Activate

# requirements.txt 설치
pip install -r requirements.txt
```
- Windows (CMD)
```
# 가상상 환경 활성화
venv\Scripts\activate.bat

# requirements.txt 설치
pip install -r requirements.txt
```
- Mac/Linux
```
# 가상상 환경 활성화
source venv/bin/activate

# requirements.txt 설치
pip install -r requirements.txt
```
### 3. FastAPI 서버 실행행
```
python -m uvicorn app.main:app --reload
```
---

### 4. SQL 
- 메뉴명 저장 table 쿼리
```
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE menu_vectors (
    menu_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```