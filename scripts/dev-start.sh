#!/bin/bash

# ============================================
# Teable Development Start Script
# ============================================
# 1. Starts Docker (PostgreSQL + Redis)
# 2. Syncs production data to local
# 3. Starts PM2 (Backend + Frontend)
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
SSH_KEY="$HOME/.ssh/id_ed25519_vultr"
SERVER_IP="149.28.148.139"
PROD_CONTAINER="teable-f7eff2df-teable-db-1"
LOCAL_CONTAINER="teable-teable-db-1"
DB_USER="teable"
DB_NAME="teable"
BACKUP_FILE="/tmp/teable_production_backup.dump"

cd "$PROJECT_DIR"

echo "🚀 Starting Teable Development Environment"
echo "==========================================="
echo ""

# Step 1: Start Docker containers
echo "1️⃣  Starting Docker containers (PostgreSQL + Redis)..."
docker compose -f docker-compose.dev.yaml up -d 2>/dev/null || docker-compose -f docker-compose.dev.yaml up -d

# Wait for PostgreSQL to be ready
echo "   Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec "$LOCAL_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        echo "   ✅ PostgreSQL is ready"
        break
    fi
    sleep 1
done

# Step 2: Sync production data
echo ""
echo "2️⃣  Syncing production data from Vultr..."
echo "   Dumping production database..."
ssh -i "$SSH_KEY" -o ConnectTimeout=10 root@"$SERVER_IP" \
    "docker exec $PROD_CONTAINER pg_dump -U $DB_USER -d $DB_NAME --format=custom" \
    > "$BACKUP_FILE" 2>/dev/null

if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    DUMP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "   Restoring to local ($DUMP_SIZE)..."
    docker exec -i "$LOCAL_CONTAINER" pg_restore \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --clean \
        --if-exists \
        --no-owner \
        < "$BACKUP_FILE" 2>/dev/null || true
    echo "   ✅ Production data synced"
else
    echo "   ⚠️  Could not connect to production server, using existing local data"
fi

# Step 3: Start PM2 (Backend first, then Frontend)
echo ""
echo "3️⃣  Starting PM2..."

# Stop any existing processes first
pm2 stop all 2>/dev/null || true

# Start backend first
echo "   Starting backend..."
pm2 start ecosystem.config.js --only teable-backend 2>/dev/null

# Wait for backend to be ready before starting frontend
echo "   Waiting for backend to be ready..."
for i in {1..60}; do
    if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/auth/user 2>/dev/null | grep -q "401"; then
        echo "   ✅ Backend is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "   ⚠️  Backend startup timed out, starting frontend anyway"
    fi
    sleep 1
done

# Now start frontend
echo "   Starting frontend..."
pm2 start ecosystem.config.js --only teable-frontend 2>/dev/null

# Wait for frontend to be ready
echo "   Waiting for frontend to be ready..."
for i in {1..30}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002/ 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
        echo "   ✅ Frontend is ready"
        break
    fi
    sleep 1
done

# Summary
echo ""
echo "==========================================="
echo "✅ Teable Development Environment Ready!"
echo "==========================================="
echo ""
echo "📍 Frontend:  http://127.0.0.1:3002"
echo "📍 Backend:   http://127.0.0.1:3000"
echo ""
echo "📋 Commands:"
echo "   pm2 logs      - View logs"
echo "   pm2 stop all  - Stop services"
echo "   pm2 restart   - Restart services"
echo ""
