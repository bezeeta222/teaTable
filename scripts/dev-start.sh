#!/bin/bash

# ============================================
# Teable Development Start Script
# ============================================
# 1. Starts Docker (PostgreSQL + Redis)
# 2. Starts PM2 (Backend + Frontend)
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

LOCAL_CONTAINER="teable-teable-db-1"
DB_USER="teable"
DB_NAME="teable"

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
    if [ $i -eq 30 ]; then
        echo "   ⚠️  PostgreSQL timeout, continuing anyway..."
    fi
    sleep 1
done

# Step 2: Ensure Prisma client is generated
echo ""
echo "2️⃣  Ensuring Prisma client is generated..."
cd "$PROJECT_DIR/packages/db-main-prisma"
if pnpm exec prisma generate --schema=prisma/postgres/schema.prisma > /dev/null 2>&1; then
    echo "   ✅ Prisma client ready"
else
    echo "   ⚠️  Prisma generate failed, trying to continue..."
fi
cd "$PROJECT_DIR"

# Step 3: Start PM2 (Backend first, then Frontend)
echo ""
echo "3️⃣  Starting PM2..."

# Delete old processes and start fresh
pm2 delete all 2>/dev/null || true

# Start backend first
echo "   Starting backend..."
pm2 start ecosystem.config.js --only teable-backend

# Wait for backend to be ready before starting frontend
echo "   Waiting for backend to be ready..."
for i in {1..60}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/auth/user 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ Backend is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "   ⚠️  Backend startup timed out"
        echo "   Check logs: pm2 logs teable-backend"
    fi
    sleep 1
done

# Now start frontend
echo "   Starting frontend..."
pm2 start ecosystem.config.js --only teable-frontend

# Wait for frontend to be ready
echo "   Waiting for frontend to be ready..."
for i in {1..30}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002/ 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
        echo "   ✅ Frontend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ⚠️  Frontend startup timed out"
    fi
    sleep 1
done

# Show status
echo ""
pm2 status

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
echo "   pm2 logs           - View all logs"
echo "   pm2 logs --lines 100  - View last 100 lines"
echo "   pnpm run dev:stop  - Stop all services"
echo "   pnpm run dev:logs  - View logs"
echo ""
