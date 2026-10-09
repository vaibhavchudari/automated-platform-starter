#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-http://127.0.0.1:8080}"
for path in healthz readyz metrics; do
  echo "Checking /$path"
  curl --fail --silent --show-error "$BASE_URL/$path" >/dev/null
done
curl --fail --silent --show-error -X POST "$BASE_URL/jobs" \
  -H 'Content-Type: application/json' -d '{"type":"smoke-test"}'
echo
echo "Smoke tests passed"
