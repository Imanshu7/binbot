@echo off
echo ==========================================
echo Starting Binbot Application Server
echo ==========================================

cd backend

echo Installing requirements...
python -m pip install -r requirements.txt

echo.
echo Starting FastAPI server...
echo Access the application at: http://localhost:8000
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
