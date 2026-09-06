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
#   scripts/start-app.sh [--mode=lexical|vector] [--sandbox|--no-sandbox] [--port=N]
#
#   --mode=lexical  (default)  --retrieval-embedder=lexical  (BM25/tf-idf, no model)
#   --mode=vector              --retrieval-embedder=vector   (embeddings; provider config
#                              is taken from the environment with ollama-local defaults)
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

for arg in "$@"; do
  case "$arg" in
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
  *) echo "scripts/start-app.sh: --mode must be 'lexical' or 'vector' (got '$MODE')" >&2; exit 2 ;;
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

echo "[start-app] launching electron (mode=$MODE, transport=http, sandbox=${SANDBOX#--}, shm=${SHM#--}) ..." >&2
exec npx electron . "${SANDBOX}" "${SHM}" "${TRANSPORT_ARGS[@]}" "${EMBEDDER_ARGS[@]}"
