#!/data/data/com.termux/files/usr/bin/bash
set -e

PGDATA="$HOME/proyecto/pgdata"
LOGDIR="$HOME/proyecto/logs"

mkdir -p "$LOGDIR"

echo "[start] Starting PostgreSQL..."
pg_ctl start -D "$PGDATA" -l "$LOGDIR/pg.log" 2>/dev/null || echo "[start] PostgreSQL already running"

sleep 2

echo "[start] Starting Redis..."
redis-server --daemonize yes 2>/dev/null || echo "[start] Redis already running"

sleep 1

echo "[start] Starting Node.js server..."
cd "$HOME/proyecto"
nohup node server.js > "$LOGDIR/server.log" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$LOGDIR/server.pid"

# Wait for server to start
for i in 1 2 3 4 5; do
  if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "[start] Server is ready (PID: $SERVER_PID)"
    echo "[start] Health: $(curl -s http://localhost:3000/api/health)"
    echo "[start] Ready! Logs: $LOGDIR/"
    exit 0
  fi
  sleep 2
done
echo "[start] Server started but not responding yet. Check logs: $LOGDIR/server.log"
