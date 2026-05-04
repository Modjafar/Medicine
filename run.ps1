# MediTrack - Run Project on Browser
# Run this script to start the server and open the app in your browser

Write-Host "Starting MediTrack Server..." -ForegroundColor Green

# Set environment to production
$env:NODE_ENV = "production"

# Start the backend server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\LENOVO\Desktop\Medicine\backend; node server.js"

# Wait for server to start
Start-Sleep -Seconds 3

# Open browser
Start-Process "http://localhost:5000"

Write-Host "Server started at http://localhost:5000" -ForegroundColor Green
