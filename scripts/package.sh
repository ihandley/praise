#!/usr/bin/env bash
# Build dist/praise-<version>.zip containing only the files Chrome needs.
set -euo pipefail
cd "$(dirname "$0")/.."
version=$(node -p "JSON.parse(require('fs').readFileSync('manifest.json','utf8')).version")
mkdir -p dist
out="dist/praise-${version}.zip"
rm -f "$out"
zip -qr "$out" manifest.json src icons -x '*.DS_Store'
echo "$out"
