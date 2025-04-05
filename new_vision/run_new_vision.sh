#!/bin/bash

echo "New Vision 서버 실행 준비중..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "가상 환경을 생성합니다."
    python3.10 -m venv .venv
    if [ $? -ne 0 ]; then
        echo "가상 환경 생성에 실패했습니다."
        exit 1
    fi
    echo "가상 환경 생성 완료!"
fi

# Activate virtual environment
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo "가상 환경 활성화에 실패했습니다."
    exit 1
fi
echo "가상 환경을 활성화합니다."

# Install dependencies if needed
echo "의존성을 설치합니다..."
pip install -r requirements-mac.txt
if [ $? -ne 0 ]; then
    echo "의존성 설치에 실패했습니다."
    deactivate
    exit 1
fi
touch .dependencies_installed
echo "의존성 설치가 완료되었습니다."

# Run New Vision server
echo "New Vision 서버를 실행합니다..."
python -m uvicorn face_api:app --host 0.0.0.0 --port 9000

# Deactivate virtual environment after server stops
deactivate
echo "New Vision 서버가 종료되었습니다." 