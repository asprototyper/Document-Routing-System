cd /d "%~dp0"

start "" cmd /k npm run dev

:wait
curl -s http://localhost:5173 >nul
if errorlevel 1 (
  timeout /t 1 >nul
  goto wait
)

start brave --incognito http://localhost:5173