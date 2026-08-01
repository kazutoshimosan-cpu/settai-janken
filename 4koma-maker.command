#!/bin/zsh
cd "$(dirname "$0")"

PORT=5180
URL="http://localhost:${PORT}/yonkoma-maker.html"

if ! lsof -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  python3 -m http.server ${PORT} >/tmp/settai-yonkoma-maker.log 2>&1 &
fi

open "${URL}"
