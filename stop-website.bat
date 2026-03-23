@echo off
taskkill /FI "WINDOWTITLE eq SmartVet Frontend*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq SmartVet Backend*" /T /F >nul 2>nul
echo SmartVet frontend and backend windows were asked to stop.
