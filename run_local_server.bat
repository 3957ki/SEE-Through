@echo off
chcp 65001 > nul

echo Jenkins 로컬 서버를 시작합니다.
set /p CONFIRM=Vision은 1번, New Vision은 2번을 입력해주세요: 

if "%CONFIRM%"=="1" (
    echo Vision 서버 실행
    start /d "vision" run_vision.bat
) else if "%CONFIRM%"=="2" (
    echo New Vision 서버 실행
    start /d "new_vision" run_new_vision.bat
) else (
    echo 잘못된 선택입니다. 1 또는 2를 입력해주세요.
    pause
    exit /b
)

echo Client 서버 실행
start /d "client" run_client.bat