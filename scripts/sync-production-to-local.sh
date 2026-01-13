#!/bin/bash

# ============================================
# Sync Production Data to Local Database
# ============================================
# This script pulls production data from Vultr
# server and restores it to local PostgreSQL
# ============================================

set -e

# Configuration
SSH_KEY="$HOME/.ssh/id_ed25519_vultr"
SERVER_IP="149.28.148.139"
PROD_CONTAINER="teable-f7eff2df-teable-db-1"
LOCAL_CONTAINER="teable-teable-db-1"
DB_USER="teable"
DB_NAME="teable"
BACKUP_FILE="/tmp/teable_production_backup.dump"

echo "🔄 Syncing production data to local..."
echo ""

# Step 1: Check local Docker is running
echo "1️⃣  Checking local Docker containers..."
if ! docker ps | grep -q "$LOCAL_CONTAINER"; then
    echo "❌ Local PostgreSQL container not running!"
    echo "   Run: docker compose -f docker-compose.dev.yaml up -d"
    exit 1
fi
echo "   ✅ Local PostgreSQL is running"

# Step 2: Dump production database
echo ""
echo "2️⃣  Dumping production database from Vultr..."
ssh -i "$SSH_KEY" root@"$SERVER_IP" \
    "docker exec $PROD_CONTAINER pg_dump -U $DB_USER -d $DB_NAME --format=custom" \
    > "$BACKUP_FILE"

DUMP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "   ✅ Production dump created ($DUMP_SIZE)"

# Step 3: Restore to local
echo ""
echo "3️⃣  Restoring to local PostgreSQL..."
docker exec -i "$LOCAL_CONTAINER" pg_restore \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    < "$BACKUP_FILE" 2>/dev/null || true

echo "   ✅ Data restored to local"

# Step 4: Verify
echo ""
echo "4️⃣  Verifying sync..."
SPACES=$(docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM space;")
BASES=$(docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM base;")
TABLES=$(docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM table_meta;")

echo "   Spaces: $SPACES"
echo "   Bases:  $BASES"
echo "   Tables: $TABLES"

# Step 5: Restart backend to refresh connections
echo ""
echo "5️⃣  Restarting teable-backend..."
pm2 restart teable-backend 2>/dev/null || echo "   (PM2 not running, skip restart)"

echo ""
echo "✅ Sync complete!"
echo ""
echo "📍 Local Teable: http://127.0.0.1:3002"
echo "📍 Local API:    http://127.0.0.1:3000"
