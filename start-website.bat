@echo off
setlocal

set ROOT=%~dp0
set FRONTEND_DIR=%ROOT%frontend
set BACKEND_DIR=%ROOT%backend
set LOG_DIR=%ROOT%runtime-logs

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Prevent duplicate instances from occupying dev ports.
taskkill /FI "WINDOWTITLE eq SmartVet Frontend*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq SmartVet Backend*" /T /F >nul 2>nul

REM Also clear any stale listeners regardless of window title.
for %%P in (5000 5173 5174) do (
	for /f "tokens=5" %%A in ('netstat -ano ^| findstr :%%P ^| findstr LISTENING') do (
		taskkill /PID %%A /F >nul 2>nul
	)
)

timeout /t 1 >nul

echo Starting local MySQL...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%start-local-mysql.ps1"
if errorlevel 1 (
	echo Failed to start local MySQL. Aborting startup.
	exit /b 1
)

echo Starting SmartVet frontend...
start "SmartVet Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm.cmd run dev"

echo Starting SmartVet backend...
start "SmartVet Backend" cmd /k "cd /d "%BACKEND_DIR%" && npm.cmd start"

echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo TIP: Use start-vetcare.ps1 for a full startup including MySQL + doctor seeding.
echo Keep both windows open to keep the website running.

endlocal
