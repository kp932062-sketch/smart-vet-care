@echo off
echo 🔄 VetCare Server Restart Script
echo ================================

echo 🛑 Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo ⏳ Waiting for processes to close...
timeout /t 2 /nobreak >nul

echo 🔍 Checking port 5000...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 5000 still in use, killing remaining processes...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
)

echo 🚀 Starting VetCare server...
echo ================================
npm run dev