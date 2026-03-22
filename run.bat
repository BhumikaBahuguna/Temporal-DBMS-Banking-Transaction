@echo off
echo Starting Temporal Banking System...

echo Starting Flask API Backend...
start cmd /k ".\.venv\Scripts\python.exe app.py"

echo Starting React Frontend...
start cmd /k "cd client && npm run dev"

echo Both servers are starting!
echo The React frontend will be available at http://localhost:5173/
echo The API backend is running at http://localhost:5000/
echo.
pause
