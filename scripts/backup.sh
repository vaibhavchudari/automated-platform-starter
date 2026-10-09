#!/usr/bin/env bash
# Local demo backup. In production use a managed backup service, encryption, immutable retention,
# EU-region storage policy, and separately stored credentials.
set -euo pipefail
OUT="${1:-backup-$(date -u +%Y%m%dT%H%M%SZ).sql}"
kubectl -n platform exec deploy/postgres -- sh -c \
  'pg_dump -U platform -d platform' > "$OUT"
test -s "$OUT"
echo "Created local demo backup: $OUT"
