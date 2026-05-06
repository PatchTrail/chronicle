#!/bin/bash
# Run this once (and again whenever you update the app)
# Then deploy docker-compose.yml via Portainer

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "→ Building Chronicle image..."
docker build -t chronicle:latest "$SCRIPT_DIR/app"
echo "✓ Done. Image: chronicle:latest"
echo ""
echo "Now in Portainer: Stacks → Add Stack → paste docker-compose.yml → Deploy"
echo "Or just run:  docker compose up -d  from $SCRIPT_DIR"
