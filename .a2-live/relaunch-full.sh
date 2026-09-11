#!/usr/bin/env bash
# Relaunch astrographer electron + gnosis-server detached, with FULL FS access so
# the main process can persist security settings to the real home userData
# (/home/ryanr/.config/provident-electron/provident-security.json). Run this
# script via an escalated (danger-full-access) bash call — the detached electron
# inherits that access.
set -u
cd "/media/ryanr/Shared Files/Projects/Astrographer" || exit 1
PORT=8081
# 1) gnosis-server
nohup setsid env GNOSIS_SERVER_PORT=$PORT ../Gnosis/target/debug/gnosis-server --port $PORT \
  > /tmp/astro-gnosis-server.log 2>&1 < /dev/null &
echo "gnosis-server pid $! port $PORT"
# 2) electron with the freshly-built dist (gnosis toggles now in the security pane)
nohup setsid env PROVIDENT_ENGINE_BASE_URL="http://127.0.0.1:$PORT" \
  npx electron . --no-sandbox --disable-dev-shm-usage --mcp-transport=http \
  > /tmp/astro-electron.log 2>&1 < /dev/null &
echo "electron pid $!"
echo "detached; returning"
