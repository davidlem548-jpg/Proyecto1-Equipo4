# Insurance Management System - Quick Start Script
# This script will help you set up and run the application

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Insurance Management System - Quick Start" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8 or higher." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Ready to Start!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Data will be loaded from CSV into memory on startup" -ForegroundColor Yellow
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start the backend server (in this window):" -ForegroundColor White
Write-Host "   python -m uvicorn server.main:app --reload" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. In a NEW terminal window, start the frontend:" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Cyan
Write-Host "   python -m http.server 5500" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Open your browser to:" -ForegroundColor White
Write-Host "   http://localhost:5500" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to start the backend server now..." -ForegroundColor Yellow
Read-Host

# Start the server
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
python -m uvicorn server.main:app --reload
