#!/usr/bin/env bash
set -u
cd "/media/ryanr/Shared Files/Projects/Astrographer" || exit 1
nohup setsid env PROVIDENT_ENGINE_BASE_URL=http://127.0.0.1:8081 PROVIDENT_OPERATOR_CREDENTIAL='user:operator' \
  npx electron . --no-sandbox --disable-dev-shm-usage --mcp-transport=http > /tmp/astro-electron.log 2>&1 </dev/null &
echo "electron pid $!"
