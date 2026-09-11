#!/usr/bin/env bash
#
# Astrographer — application launcher.
#
# Builds the app and starts the Electron shell with the HTTP MCP server
# (127.0.0.1:3787 by default) and the retrieval-embedder mode selected. The
# script exists because the current host aborts Electron on the SUID sandbox
# helper (`node_modules/electron/dist/chrome-sandbox` not owned-by-root/4755),
# so the common dev launch (`npm run start:http`) dies before the window.
#
# USAGE
#   scripts/start-app.sh [--mode=lexical|vector|gnosis] [--sandbox|--no-sandbox] [--port=N]
#
#   --mode=lexical  (default)  --retrieval-embedder=lexical  (BM25/tf-idf, no model)
#   --mode=vector              --retrieval-embedder=vector   (embeddings; provider config
#                              is taken from the environment with ollama-local defaults)
#   --mode=gnosis              ALSO spawn the Gnosis server (the P2 `gnosis-server` binary)
#                              alongside the app and point the shell at it. The local
#                              retrieval embedder stays at its default (lexical) unless you
#                              also pass --mode=lexical|vector — the gnosis toggle is
#                              orthogonal to the local embedder. See the GNOSIS_* ENV below.
#   --sandbox / --no-sandbox   force Electron's chromium sandbox on/off. DEFAULT is
#                              --no-sandbox (the SUID helper is misconfigured here). Pass
#                              --sandbox after fixing `sudo chown root:root
#                              node_modules/electron/dist/chrome-sandbox &&
#                              sudo chmod 4755 node_modules/electron/dist/chrome-sandbox`.
#   --shm-usage / --disable-dev-shm-usage
#                              force Chromium's /dev/shm usage on/off. DEFAULT is
#                              --disable-dev-shm-usage (this host's /dev/shm is not
#                              writable, so Chromium must use /tmp for shared memory —
#                              the standard container fix). Pass --shm-usage on a host
#                              with a writable /dev/shm to restore the default path.
#   --port=N                   the MCP HTTP port (default 3787).
#
# ENV HONORED (export before running; the script's vector-mode defaults are
# applied ONLY when the corresponding variable is unset):
#   PROVIDENT_MCP_TRANSPORT   http | pipe        (default http)
#   PROVIDENT_MCP_PORT                         (default 3787, or --port)
#   PROVIDENT_RETRIEVAL_EMBEDDER lexical | vector (overrides --mode)
#   PROVIDENT_EMBEDDING_PROVIDER ollama | openai | cohere | <custom>
#   PROVIDENT_EMBEDDING_BASE_URL
#   PROVIDENT_EMBEDDING_MODEL
#   PROVIDENT_EMBEDDING_API_KEY      (remote/cloud)
#   PROVIDENT_EMBEDDING_DIMENSION
#   PROVIDENT_EMBEDDING_TIMEOUT_MS
#
# GNOSIS_* ENV (--mode=gnosis):
#   GNOSIS_SERVER_BIN          path to the gnosis-server binary. DEFAULT
#                              $ROOT/../Gnosis/target/debug/gnosis-server (the P2 binary).
#   GNOSIS_SERVER_PORT         the loopback port the server binds. DEFAULT 8080
#                              (matches the shell's default PROVIDENT_ENGINE_BASE_URL).
#                              The server binds loopback-only (127.0.0.1) by design.
#   GNOSIS_SERVER_OLLAMA_URL   optional Ollama base URL so the server reaches
#                              state:Ready and emits a real SSE stream (default
#                              http://localhost:11434).
#   GNOSIS_SERVER_OLLAMA_MODEL optional embed model (default nomic-embed-text).
#   PROVIDENT_ENGINE_BASE_URL  NOTE: in --mode=gnosis this is set automatically to
#                              http://127.0.0.1:$GNOSIS_SERVER_PORT AFTER the shell's
#                              config-seam priority (config seam wins if an operator
#                              override is persisted in provident-engine-config.json).
#
# The vector-mode local defaults mirror Unit F's ollama concrete provider:
#   provider=ollama  base_url=http://localhost:11434  model=embeddinggemma
# To use a remote/cloud provider, export your own PROVIDENT_EMBEDDING_* first —
# unset variables keep the local defaults, so run an LLM-agnostic vector boot
# (e.g. ollama at a non-default URL) by exporting PROVIDENT_EMBEDDING_BASE_URL.
#
# NOTE: the app boots the operator's real userData (the persisted RAG store).
# For an isolated, disposable environment the live batteries use
# `HOME=$(mktemp -d) scripts/start-app.sh --mode=...` (never the real store).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${PROVIDENT_RETRIEVAL_EMBEDDER:-lexical}"
PORT=""
SANDBOX="--no-sandbox"
SHM="--disable-dev-shm-usage"
GNOSIS=0

for arg in "$@"; do
  case "$arg" in
    --mode=gnosis) GNOSIS=1 ;;  # orthogonal to the local embedder — MODE unchanged
    --mode=*) MODE="${arg#--mode=}" ;;
    --sandbox) SANDBOX="--sandbox" ;;
    --no-sandbox) SANDBOX="--no-sandbox" ;;
    --shm-usage) SHM="--enable-dev-shm-usage" ;;
    --disable-dev-shm-usage) SHM="--disable-dev-shm-usage" ;;
    --port=*) PORT="${arg#--port=}" ;;
    *) echo "scripts/start-app.sh: unknown arg '$arg'" >&2; exit 2 ;;
  esac
done

case "$MODE" in
  lexical|vector) ;;
  *) echo "scripts/start-app.sh: --mode must be 'lexical' or 'vector' (or 'gnosis', which keeps the embedder) (got '$MODE')" >&2; exit 2 ;;
esac

# Build the bundles (dist/) first — the app runs from dist, so it must be
# current. Reuses the same esbuild commands as `npm run build`.
echo "[start-app] building dist/ ..." >&2
npm run build >/dev/null

# Transport: the HTTP MCP server on :3787 is the default. If the operator
# exported PROVIDENT_MCP_TRANSPORT, honor it (do NOT pass a flag, which would
# override the env in the app's argv-first parsing).
TRANSPORT_ARGS=()
if [ -z "${PROVIDENT_MCP_TRANSPORT:-}" ]; then
  TRANSPORT_ARGS+=(--mcp-transport=http)
fi
if [ -n "$PORT" ]; then TRANSPORT_ARGS+=(--mcp-port="$PORT"); fi

EMBEDDER_ARGS=(--retrieval-embedder="$MODE")

if [ "$MODE" = "vector" ]; then
  # Apply the ollama-local defaults only where the caller has not exported a
  # value. An exported PROVIDENT_EMBEDDING_* wins (remote/cloud providers).
  export PROVIDENT_EMBEDDING_PROVIDER="${PROVIDENT_EMBEDDING_PROVIDER:-ollama}"
  export PROVIDENT_EMBEDDING_BASE_URL="${PROVIDENT_EMBEDDING_BASE_URL:-http://localhost:11434}"
  export PROVIDENT_EMBEDDING_MODEL="${PROVIDENT_EMBEDDING_MODEL:-embeddinggemma}"
  echo "[start-app] vector mode — provider=${PROVIDENT_EMBEDDING_PROVIDER} base=${PROVIDENT_EMBEDDING_BASE_URL} model=${PROVIDENT_EMBEDDING_MODEL}" >&2
fi

# --mode=gnosis: spawn the P2 `gnosis-server` binary alongside the app and point
# the shell at it. The Astrographer shell is a PURE CLIENT (it never spawns the
# server), so the launcher does that orchestration for the app. The server is
# loopback-bound (127.0.0.1), standalone, and killed when the app exits. This is
# config-only launcher behavior — it touches no source and no JS contract.
GNOSIS_SERVER_PID=""
if [ "$GNOSIS" = "1" ]; then
  GS_BIN="${GNOSIS_SERVER_BIN:-$ROOT/../Gnosis/target/debug/gnosis-server}"
  GS_PORT="${GNOSIS_SERVER_PORT:-8080}"
  if [ ! -x "$GS_BIN" ]; then
    echo "[start-app] --mode=gnosis: gnosis-server binary not found or not executable at '$GS_BIN' (set GNOSIS_SERVER_BIN)" >&2
    exit 2
  fi
  # Point the shell at the server. NOTE: the app's resolveEngineBaseUrl reads its
  # CONFIG SEAM first (provident-engine-config.json), so an operator-set override
  # still wins over this export — by design.
  export PROVIDENT_ENGINE_BASE_URL="http://127.0.0.1:${GS_PORT}"
  # Forward the optional Ollama wiring so the server can reach state:Ready (the
  # server reads these env vars at ITS start). Unset → the server's own defaults.
  if [ -n "${GNOSIS_SERVER_OLLAMA_URL:-}" ]; then export GNOSIS_SERVER_OLLAMA_URL; fi
  if [ -n "${GNOSIS_SERVER_OLLAMA_MODEL:-}" ]; then export GNOSIS_SERVER_OLLAMA_MODEL; fi
  echo "[start-app] spawning gnosis-server (bin=$GS_BIN port=$GS_PORT) ..." >&2
  "$GS_BIN" --port "$GS_PORT" &
  GNOSIS_SERVER_PID=$!
  # Wait for readiness (GET /engine/status always answers; a fresh bind may take a
  # moment). Up to ~10s.
  READY=0
  for i in $(seq 1 40); do
    if curl -fsS "http://127.0.0.1:${GS_PORT}/engine/status" >/dev/null 2>&1; then READY=1; break; fi
    sleep 0.25
  done
  if [ "$READY" != "1" ]; then
    echo "[start-app] gnosis-server did not answer /engine/status on 127.0.0.1:${GS_PORT}" >&2
    kill "$GNOSIS_SERVER_PID" 2>/dev/null || true
    exit 2
  fi
  echo "[start-app] gnosis-server READY at ${PROVIDENT_ENGINE_BASE_URL} (pid $GNOSIS_SERVER_PID)" >&2
fi

echo "[start-app] launching electron (mode=$MODE, transport=http, sandbox=${SANDBOX#--}, shm=${SHM#--}, gnosis=$GNOSIS) ..." >&2
if [ "$GNOSIS" = "1" ] && [ -n "$GNOSIS_SERVER_PID" ]; then
  # Spawned the server → run electron in the foreground (NOT exec) so we can
  # kill the server after the app exits; propagate electron's exit status.
  set +e
  npx electron . "${SANDBOX}" "${SHM}" "${TRANSPORT_ARGS[@]}" "${EMBEDDER_ARGS[@]}"
  STATUS=$?
  set -e
  kill "$GNOSIS_SERVER_PID" 2>/dev/null || true
  echo "[start-app] gnosis-server stopped; electron exited with $STATUS" >&2
  exit "$STATUS"
fi
exec npx electron . "${SANDBOX}" "${SHM}" "${TRANSPORT_ARGS[@]}" "${EMBEDDER_ARGS[@]}"
