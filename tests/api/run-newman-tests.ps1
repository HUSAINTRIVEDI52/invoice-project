# Newman Test Runner Script (PowerShell)
# Runs Postman collection tests using Newman CLI

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Collection = "tests/api/invoice-system.postman_collection.json",
    [string]$ReportDir = "tests/api/reports"
)

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           Newman API Tests - Invoice System                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Newman is installed
try {
    $null = Get-Command newman -ErrorAction Stop
    Write-Host "✓ Newman is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Newman is not installed. Installing..." -ForegroundColor Red
    npm install -g newman newman-reporter-htmlextra
}

# Create reports directory
if (-not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir | Out-Null
}

Write-Host "📋 Test Configuration:" -ForegroundColor Cyan
Write-Host "   Base URL: $BaseUrl"
Write-Host "   Collection: $Collection"
Write-Host "   Reports: $ReportDir"
Write-Host ""

# Check if server is running
Write-Host "🔍 Checking if server is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $BaseUrl -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Server is running at $BaseUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running at $BaseUrl" -ForegroundColor Red
    Write-Host "   Please start the server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Running API tests..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Generate timestamp for report
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$htmlReport = Join-Path $ReportDir "report-$timestamp.html"
$jsonReport = Join-Path $ReportDir "report-$timestamp.json"

# Run Newman tests
newman run $Collection `
    --env-var "base_url=$BaseUrl" `
    --reporters cli,htmlextra,json `
    --reporter-htmlextra-export $htmlReport `
    --reporter-json-export $jsonReport `
    --color on `
    --delay-request 100 `
    --timeout-request 10000

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ($exitCode -eq 0) {
    Write-Host "✅ All API tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Reports generated in: $ReportDir" -ForegroundColor Cyan
    Write-Host "   HTML Report: $htmlReport" -ForegroundColor Gray
    Write-Host "   JSON Report: $jsonReport" -ForegroundColor Gray
} else {
    Write-Host "❌ Some API tests failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📊 Check the reports in: $ReportDir" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Newman tests completed successfully!" -ForegroundColor Green
