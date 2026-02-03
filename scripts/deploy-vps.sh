#!/usr/bin/env bash
set -euo pipefail

REPO_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_DIR"

echo "[deploy] git fetch & pull..."
git fetch --all --prune
# Supprimer les fichiers non suivis qui bloquent le merge (artefacts locaux)
rm -f package-lock.json tsconfig.tsbuildinfo tsconfig.node.tsbuildinfo 2>/dev/null || true
git pull --rebase --autostash origin main

echo "[deploy] installing dependencies..."
npm ci

echo "[deploy] building..."
npm run build

echo "[deploy] starting/reloading pm2..."
npm run pm2:reload

echo "[deploy] done."


