#!/usr/bin/env bash
# Launch the Astrographer app + gnosis-server, fully detached (survives this
# shell). Both run in their own sessions via setsid + nohup.
set -u
cd "/media/ryanr/Shared Files/Projects/Astrographer" || exit 1

# Kill any prior instance
pkill -f "gnosis-server --port 8081" 2>/dev/null
pkill -f "user-data-dir=/tmp/astro-gnosis-ud-" 2>/dev/null
sleep 1

UDIR="${1:-/tmp/astro-gnosis-ud-live}"
mkdir -p "$UDIR"
echo "{ \"token\": null, \"enabled\": [\"read\", \"dispatch\", \"graph\", \"code\", \"module\", \"rag\", \"edit\", \"gnosis\", \"gnosis-edit\"] }" > "$UDIR/provident-security.json"

# 1) gnosis-server on 8081 (avoid the 8080 default clash with any leftover)
nohup setsid env GNOSIS_SERVER_PORT=8081 ../Gnosis/target/debug/gnosis-server --port 8081 \
  > /tmp/astro-gnosis-server.log 2>&1 < /dev/null &
echo "gnosis-server launched (pid $!) port 8081"

# 2) electron with isolated user-data-dir + engine base url at 8081
nohup setsid env HOME="$UDIR" XDG_CONFIG_HOME="$UDIR" PROVIDENT_ENGINE_BASE_URL=http://127.0.0.1:8081 \
  npx electron . --user-data-dir="$UDIR" --no-sandbox --disable-dev-shm-usage --mcp-transport=http \
  > /tmp/astro-electron.log 2>&1 < /dev/null &
echo "electron launched (pid $!)"

echo "detached; this shell returns now"
