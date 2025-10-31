# Quick Start Frontend Only
# Run this in a separate terminal after the backend is running

Write-Host "Starting Insurance Management Frontend..." -ForegroundColor Cyan

Set-Location client

Write-Host "Frontend server starting at http://localhost:5500" -ForegroundColor Green
Write-Host ""
Write-Host "Make sure the backend is running at http://localhost:8000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python -m http.server 5500
