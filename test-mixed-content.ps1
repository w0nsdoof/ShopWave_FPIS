# Test script to check for mixed content issues
$ErrorActionPreference = "Stop"

Write-Host "Building Next.js application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Fix the errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "Starting static file server to test the build..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server when finished testing" -ForegroundColor Yellow

# Use http-server to serve the static site
# Install it first if it's not already installed
if (!(Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "Installing npx..." -ForegroundColor Cyan
    npm install -g npx
}

# Start http-server with HTTPS (for testing mixed content issues)
npx http-server ./out -p 3000 --ssl --cert ./localhost.crt --key ./localhost.key

Write-Host "Server stopped" -ForegroundColor Cyan
