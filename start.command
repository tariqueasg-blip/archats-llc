#!/bin/bash
# Double-click to start the Archats site (static — no AI backend needed).
cd "$(dirname "$0")"
node server.js &
SERVER_PID=$!
sleep 2
open "http://localhost:3000"
echo "Site running at http://localhost:3000 — press Ctrl+C or close this window to stop."
wait $SERVER_PID
