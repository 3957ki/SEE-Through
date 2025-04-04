@echo off
chcp 65001 > nul
echo React 서버 실행 준비중...

:: 패키지 설치
echo 패키지를 설치합니다.
call npm install
echo 패키지 설치 완료!

:: React 서버 실행
echo React 개발 서버를 시작합니다.
call npm run dev

:: React 서버 종료
echo React 개발 서버가 종료되었습니다.
pause