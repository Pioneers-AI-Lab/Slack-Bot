#!/bin/bash

# Script to call the digest endpoint
# Usage:
#   ./scripts/call-endpoint.sh [daily|weekly] [url]
#
# Examples:
#   ./scripts/call-endpoint.sh daily
#   ./scripts/call-endpoint.sh weekly http://localhost:3000
#   ./scripts/call-endpoint.sh daily https://your-project.vercel.app

MODE=${1:-daily}
BASE_URL=${2:-http://localhost:3000}

if [ "$MODE" != "daily" ] && [ "$MODE" != "weekly" ]; then
  echo "❌ Invalid mode. Use 'daily' or 'weekly'"
  echo "   Usage: ./scripts/call-endpoint.sh [daily|weekly] [url]"
  exit 1
fi

URL="${BASE_URL}/api/digest?mode=${MODE}"

echo "📞 Calling endpoint: ${URL}"
echo "   Mode: ${MODE}"
echo "   Base URL: ${BASE_URL}"
echo ""

START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -w "\n%{http_code}" "${URL}")
END_TIME=$(date +%s%N)

# Extract status code (last line) and body (everything else)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

DURATION_MS=$(( (END_TIME - START_TIME) / 1000000 ))

echo "📊 Response Status: ${HTTP_CODE}"
echo "⏱️  Duration: ${DURATION_MS}ms"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Success!"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  
  # Extract and display summary if jq is available
  if command -v jq &> /dev/null; then
    DIGEST_TYPE=$(echo "$BODY" | jq -r '.digest_type // empty')
    EVENTS_COUNT=$(echo "$BODY" | jq -r '.events_count // empty')
    MILESTONES_COUNT=$(echo "$BODY" | jq -r '.milestones_count // empty')
    
    if [ -n "$DIGEST_TYPE" ]; then
      echo ""
      echo "   📅 Digest Type: ${DIGEST_TYPE}"
      echo "   📋 Events: ${EVENTS_COUNT}"
      echo "   🎯 Milestones: ${MILESTONES_COUNT}"
    fi
  fi
else
  echo "❌ Error Response:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  exit 1
fi

