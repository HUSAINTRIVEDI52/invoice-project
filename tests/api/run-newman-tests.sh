#!/bin/bash
# Newman Test Runner Script
# Runs Postman collection tests using Newman CLI

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           Newman API Tests - Invoice System                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
COLLECTION="tests/api/invoice-system.postman_collection.json"
ENVIRONMENT="tests/api/environment.json"
REPORT_DIR="tests/api/reports"

# Check if Newman is installed
if ! command -v newman &> /dev/null; then
    echo "❌ Newman is not installed. Installing..."
    npm install -g newman newman-reporter-htmlextra
fi

# Create reports directory
mkdir -p "$REPORT_DIR"

echo "📋 Test Configuration:"
echo "   Base URL: $BASE_URL"
echo "   Collection: $COLLECTION"
echo "   Reports: $REPORT_DIR"
echo ""

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s "$BASE_URL" > /dev/null; then
    echo "✅ Server is running at $BASE_URL"
else
    echo "❌ Server is not running at $BASE_URL"
    echo "   Please start the server with: npm run dev"
    exit 1
fi

echo ""
echo "🚀 Running API tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run Newman tests
newman run "$COLLECTION" \
    --env-var "base_url=$BASE_URL" \
    --reporters cli,htmlextra,json \
    --reporter-htmlextra-export "$REPORT_DIR/report-$(date +%Y%m%d-%H%M%S).html" \
    --reporter-json-export "$REPORT_DIR/report-$(date +%Y%m%d-%H%M%S).json" \
    --color on \
    --delay-request 100 \
    --timeout-request 10000

EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All API tests passed!"
    echo ""
    echo "📊 Reports generated in: $REPORT_DIR"
    echo "   Open the HTML report to view detailed results"
else
    echo "❌ Some API tests failed!"
    echo ""
    echo "📊 Check the reports in: $REPORT_DIR"
    exit 1
fi

echo ""
echo "🎉 Newman tests completed successfully!"
