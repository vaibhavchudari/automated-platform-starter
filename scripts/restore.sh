#!/usr/bin/env bash
# Destructive to the target database. Use only in a disposable local demo.
set -euo pipefail
IN="${1:?Usage: scripts/restore.sh backup.sql}"
test -s "$IN"
cat "$IN" | kubectl -n platform exec -i deploy/postgres -- \
  psql -U platform -d platform
echo "Restore command completed; verify application-level data checks."
