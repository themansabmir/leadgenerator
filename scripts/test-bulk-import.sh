#!/bin/bash

# Bulk Import Test Script
# Tests all three modules with sample CSV files

BASE_URL="http://localhost:3000"
SAMPLES_DIR="public/samples"

echo "🚀 Testing Bulk Import API"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_module() {
    local module=$1
    local file=$2
    
    echo -e "${YELLOW}Testing ${module}...${NC}"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/bulk-import/${module}" \
        -F "file=@${file}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 207 ]; then
        echo -e "${GREEN}✓ ${module} test passed (HTTP ${http_code})${NC}"
        echo "$body" | jq '.'
    else
        echo -e "${RED}✗ ${module} test failed (HTTP ${http_code})${NC}"
        echo "$body" | jq '.'
    fi
    
    echo ""
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "${BASE_URL}" > /dev/null; then
    echo -e "${RED}Error: Server is not running at ${BASE_URL}${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Test each module
test_module "dorks" "${SAMPLES_DIR}/dorks-sample.csv"
test_module "categories" "${SAMPLES_DIR}/categories-sample.csv"
test_module "locations" "${SAMPLES_DIR}/locations-sample.csv"

echo "=========================="
echo "✅ All tests completed"
