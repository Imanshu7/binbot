@echo off
echo -------------------------------------------
echo Starting Binbot Application Server
echo -------------------------------------------

cd backend

echo Installing requirements...
python -m pip install -r requirements.txt

echo.
echo Starting FastAPI server...
echo Access the application at: http://localhost:8000
echo Made By: Team BinBot - IIT Patna CSDA Capstone Project-1 
echo Group Members: Ishika, Kirti, Hattam, Himanshu, Gourav // Group No.- 3
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
