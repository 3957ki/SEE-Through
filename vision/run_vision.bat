@echo off
chcp 65001 > nul
echo Vision 서버 실행 준비중...

:: 가상 환경이 존재하는지 확인
if not exist .venv\ (
    echo 가상 환경을 생성합니다.
    py -3.10 -m venv .venv
    echo 가상 환경 생성 완료!
)

:: 가상 환경 활성화
call .venv\Scripts\activate.bat
echo 가상 환경을 활성화합니다.

:: requirements.txt가 존재하는지 확인하고 패키지 설치
if exist requirements.txt (
    echo 필요한 패키지를 설치합니다.
    pip install -r requirements.txt --upgrade-strategy only-if-needed
    echo 패키지 설치 완료!
)

:: Vision 서버 실행
echo Vision 서버를 실행합니다...
python -m uvicorn face_api:app --host 0.0.0.0 --port 9000

:: 서버 종료 후 가상 환경 비활성화
call .venv\Scripts\deactivate.bat
echo Vision 서버가 종료되었습니다.
pause