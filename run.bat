@echo off
echo Starting MediTrack Server...
cd /d c:\Users\LENOVO\Desktop\Medicine\backend
set NODE_ENV=production
start node server.js
timeout /t 3 /nobreak >nul
start http://localhost:5000
echo.
echo Server started at http://localhost:5000
echo.
pause
