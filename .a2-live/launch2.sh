#!/usr/bin/env bash
# Launch Astrographer + gnosis-server, detached, with XDG_CONFIG_HOME seeded
# so the app's userData (including gnosis/gnosis-edit groups) resolves here.
set -u
cd "/media/ryanr/Shared Files/Projects/Astrographer" || exit 1

XCG=/tmp/astro-xdg-seed
PORT=8081
UDIR=/tmp/astro-gnosis-ud2    # any; userData comes from XDG_CONFIG_HOME

# 1) gnosis-server (clean)
nohup setsid env GNOSIS_SERVER_PORT=$PORT ../Gnosis/target/debug/gnosis-server --port $PORT \
  > /tmp/astro-gnosis-server.log 2>&1 < /dev/null &
echo "gnosis-server pid $! port $PORT"

# 2) electron — XDG_CONFIG_HOME points at the seeded dir → userData = $XCG/provident-electron
nohup setsid env HOME=/tmp/astro-home XDG_CONFIG_HOME="$XCG" \
  PROVIDENT_ENGINE_BASE_URL="http://127.0.0.1:$PORT" \
  npx electron . --no-sandbox --disable-dev-shm-usage --mcp-transport=http \
  > /tmp/astro-electron.log 2>&1 < /dev/null &
echo "electron pid $!"
echo "detached; returning"
