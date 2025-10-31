# Quick Start Backend Only
# Run this to start just the FastAPI backend server

Write-Host "Starting Insurance Management Backend..." -ForegroundColor Cyan
Write-Host "Using in-memory storage (no database file)" -ForegroundColor Yellow

# Start the server
Write-Host "Backend server starting at http://localhost:8000" -ForegroundColor Green
Write-Host "API documentation available at http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python -m uvicorn server.main:app --reload
