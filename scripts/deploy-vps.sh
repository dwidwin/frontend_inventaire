#!/usr/bin/env bash
set -euo pipefail

REPO_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_DIR"

echo "[deploy] git fetch & pull..."
git fetch --all --prune
git pull --rebase --autostash origin main || true

echo "[deploy] installing dependencies..."
npm ci

echo "[deploy] building..."
npm run build

echo "[deploy] starting/reloading pm2..."
npm run pm2:reload

echo "[deploy] done."


