#!/bin/bash

# ============================================
# Teable Production Deployment Script
# ============================================
# 1. Build Docker image
# 2. Push to Docker Hub
# 3. Trigger Dokploy to redeploy
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
DOCKER_IMAGE="bezeeta444/therawteatable"
DOCKER_TAG="${1:-latest}"
SSH_KEY="$HOME/.ssh/id_ed25519_vultr"
SERVER_IP="149.28.148.139"

cd "$PROJECT_DIR"

echo "🚀 Deploying Teable to Production"
echo "=================================="
echo ""
echo "Image: $DOCKER_IMAGE:$DOCKER_TAG"
echo ""

# Step 1: Build Docker image
echo "1️⃣  Building Docker image..."
docker build \
    -f dockers/teable/Dockerfile \
    -t "$DOCKER_IMAGE:$DOCKER_TAG" \
    --build-arg BUILD_VERSION="$(date +%Y%m%d-%H%M%S)" \
    .

echo "   ✅ Image built successfully"

# Step 2: Push to Docker Hub
echo ""
echo "2️⃣  Pushing to Docker Hub..."
docker push "$DOCKER_IMAGE:$DOCKER_TAG"
echo "   ✅ Image pushed to Docker Hub"

# Step 3: Trigger Dokploy redeploy
echo ""
echo "3️⃣  Triggering Dokploy redeploy..."

# Pull latest image and restart containers on server
ssh -i "$SSH_KEY" root@"$SERVER_IP" << 'EOF'
    echo "   Pulling latest image..."
    docker pull bezeeta444/therawteatable:latest

    echo "   Restarting Teable containers..."
    # Find and restart teable containers
    TEABLE_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '^teable.*teable-1$' | head -1)
    if [ -n "$TEABLE_CONTAINER" ]; then
        docker restart "$TEABLE_CONTAINER"
        echo "   ✅ Container $TEABLE_CONTAINER restarted"
    else
        echo "   ⚠️  Teable container not found, trying docker compose..."
        # Alternative: Use Dokploy's compose restart
        cd /var/lib/dokploy/compose/teable-* 2>/dev/null && docker compose pull && docker compose up -d
    fi
EOF

echo ""
echo "4️⃣  Verifying deployment..."
sleep 10

# Check if the app is responding
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://teable.theraw.com.my/api/auth/user 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "401" ]; then
    echo "   ✅ Deployment successful! App is responding."
else
    echo "   ⚠️  App returned HTTP $HTTP_STATUS - please check logs"
fi

echo ""
echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "📍 Production URL: https://teable.theraw.com.my"
echo ""
echo "📋 Useful commands:"
echo "   ssh -i $SSH_KEY root@$SERVER_IP 'docker logs -f \$(docker ps -q -f name=teable.*teable-1)'"
echo ""
