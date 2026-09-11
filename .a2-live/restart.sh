#!/usr/bin/env bash
# Stop any astrographer electron + gnosis-server, then relaunch detached with
# the freshly-built dist/ (which now renders the gnosis/gnosis-edit toggles in
# the security pane). Uses the real home userData so the user can toggle groups.
set -u
cd "/media/ryanr/Shared Files/Projects/Astrographer" || exit 1

# Kill existing by exact exe match (never matches this script's own cmdline)
for d in /proc/[0-9]*/exe; do
  exe=$(readlink "$d" 2>/dev/null) || continue
  case "$exe" in
    *Astrographer*node_modules/electron/dist/electron) pid=${d#/proc/}; pid=${pid%/exe}; kill -9 "$pid" 2>/dev/null && echo "killed electron $pid";;
    *gnosis-server*) pid=${d#/proc/}; pid=${pid%/exe}; if kill -9 "$pid" 2>/dev/null; then :; fi;;
  esac
done
sleep 2

PORT=8081
# 1) gnosis-server
nohup setsid env GNOSIS_SERVER_PORT=$PORT ../Gnosis/target/debug/gnosis-server --port $PORT \
  > /tmp/astro-gnosis-server.log 2>&1 < /dev/null &
echo "gnosis-server pid $! port $PORT"
# 2) electron with the rebuilt dist (real home userData so group toggles persist)
nohup setsid env PROVIDENT_ENGINE_BASE_URL="http://127.0.0.1:$PORT" \
  npx electron . --no-sandbox --disable-dev-shm-usage --mcp-transport=http \
  > /tmp/astro-electron.log 2>&1 < /dev/null &
echo "electron pid $!"
echo "detached; returning"
