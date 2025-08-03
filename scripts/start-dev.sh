#!/bin/bash

echo "Team Topology Viewer - Development Environment Setup"
echo "===================================================="

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
docker-compose up -d postgres redis rabbitmq

# PostgreSQLの起動を待つ
echo "Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U ttv_user > /dev/null 2>&1; do
  sleep 1
done

echo "PostgreSQL is ready!"

# 依存関係のインストール
echo "Installing dependencies..."
pnpm install

# Prismaのセットアップ
echo "Setting up Prisma..."
cd services/team-service && pnpm prisma generate && cd ../..
cd services/interaction-service && pnpm prisma generate && cd ../..

# サービスの起動
echo "Starting all services..."
echo ""
echo "Services will be available at:"
echo "- GraphQL Gateway: http://localhost:4000/graphql"
echo "- Team Service: http://localhost:3001"
echo "- Interaction Service: http://localhost:3002"
echo "- Web App: http://localhost:3000"
echo "- RabbitMQ Management: http://localhost:15672 (ttv_user/ttv_password)"
echo ""

# 開発サーバーの起動
pnpm run dev