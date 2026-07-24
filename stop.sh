#!/data/data/com.termux/files/usr/bin/bash
LOGDIR="$HOME/proyecto/logs"
echo "[stop] Stopping Node.js server..."
if [ -f "$LOGDIR/server.pid" ]; then
  kill $(cat "$LOGDIR/server.pid") 2>/dev/null || true
  rm "$LOGDIR/server.pid"
fi
echo "[stop] Stopping PostgreSQL..."
pg_ctl stop -D "$HOME/proyecto/pgdata" 2>/dev/null || true
echo "[stop] Stopping Redis..."
redis-cli shutdown 2>/dev/null || true
echo "[stop] Done"
