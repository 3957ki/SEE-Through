@echo off
echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Starting FastAPI server...
uvicorn face_api:app --host 0.0.0.0 --port 9000

pause
