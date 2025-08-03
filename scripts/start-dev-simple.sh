#!/bin/bash

echo "Team Topology Viewer - Development Environment Setup (Simple)"
echo "============================================================"

# 環境変数ファイルのセットアップ
echo "Setting up environment files..."
cp .env.example .env 2>/dev/null || true

for service in services/*/; do
  if [ -f "$service/.env.example" ]; then
    cp "$service/.env.example" "$service/.env" 2>/dev/null || true
  fi
done

for app in frontend/*/; do
  if [ -f "$app/.env.example" ]; then
    cp "$app/.env.example" "$app/.env" 2>/dev/null || true
  fi
done

# Docker Composeの起動
echo "Starting infrastructure services..."
docker-compose -f docker-compose.dev.yml up -d

# PostgreSQLの起動を待つ
echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "PostgreSQL should be ready!"

# 依存関係のインストール
echo "Installing dependencies..."
pnpm install

# Prismaのセットアップ
echo "Setting up Prisma..."
cd services/team-service && pnpm prisma generate && cd ../..
cd services/interaction-service && pnpm prisma generate && cd ../..

echo ""
echo "Infrastructure is ready!"
echo ""
echo "Now start each service manually in separate terminals:"
echo ""
echo "Terminal 1 - Team Service:"
echo "  cd services/team-service && pnpm dev"
echo ""
echo "Terminal 2 - Interaction Service:"
echo "  cd services/interaction-service && pnpm dev"
echo ""
echo "Terminal 3 - GraphQL Gateway:"
echo "  cd services/gateway && pnpm dev"
echo ""
echo "Terminal 4 - Web App:"
echo "  cd frontend/web-app && pnpm dev"
echo ""
echo "Services will be available at:"
echo "- GraphQL Gateway: http://localhost:4000/graphql"
echo "- Team Service: http://localhost:3001"
echo "- Interaction Service: http://localhost:3002"
echo "- Web App: http://localhost:3000"
echo "- RabbitMQ Management: http://localhost:15672 (ttv_user/ttv_password)"
echo "