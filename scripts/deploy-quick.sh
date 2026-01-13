#!/bin/bash

# ============================================
# Quick Redeploy (No Build)
# ============================================
# Just pulls latest image and restarts
# Use when image is already pushed
# ============================================

set -e

SSH_KEY="$HOME/.ssh/id_ed25519_vultr"
SERVER_IP="149.28.148.139"

echo "🔄 Quick Redeploy (pulling latest image)..."
echo ""

ssh -i "$SSH_KEY" root@"$SERVER_IP" << 'EOF'
    echo "Pulling latest image..."
    docker pull bezeeta444/therawteatable:latest

    echo "Finding Teable container..."
    TEABLE_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E 'teable.*teable-1' | head -1)

    if [ -n "$TEABLE_CONTAINER" ]; then
        echo "Restarting $TEABLE_CONTAINER..."
        docker stop "$TEABLE_CONTAINER"
        docker rm "$TEABLE_CONTAINER"

        # Recreate using docker compose
        COMPOSE_DIR=$(find /var/lib/dokploy/compose -name "*teable*" -type d 2>/dev/null | head -1)
        if [ -n "$COMPOSE_DIR" ]; then
            cd "$COMPOSE_DIR"
            docker compose up -d
        fi
    fi
EOF

echo ""
echo "Waiting for app to start..."
sleep 10

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://teable.theraw.com.my/api/auth/user 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "401" ]; then
    echo "✅ Redeploy successful!"
else
    echo "⚠️  App returned HTTP $HTTP_STATUS"
fi

echo ""
echo "📍 https://teable.theraw.com.my"
