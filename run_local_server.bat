@echo off
chcp 65001 > nul

echo Client 서버 실행
start /d "client" run_client.bat

echo Vision 서버 실행
start /d "vision" run_vision.bat