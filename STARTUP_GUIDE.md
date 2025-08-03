# Team Topology Viewer - 起動ガイド

## クイックスタート

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 開発環境の起動
./scripts/start-dev.sh
```

## 起動時のトラブルシューティング

### エラー: "concurrently: command not found"
```bash
pnpm install
```

### エラー: "Cannot find module '@prisma/client'"
```bash
cd services/team-service && pnpm prisma generate && cd ../..
cd services/interaction-service && pnpm prisma generate && cd ../..
```

### エラー: "docker-compose: command not found"
DockerとDocker Composeがインストールされていることを確認してください。

### エラー: ポートが使用中
以下のポートが空いていることを確認してください：
- 3000: Web App
- 3001: Team Service
- 3002: Interaction Service
- 4000: GraphQL Gateway
- 5432: PostgreSQL
- 6379: Redis
- 15672: RabbitMQ Management

### PostgreSQLへの接続エラー
```bash
# Dockerコンテナが起動していることを確認
docker-compose -f docker-compose.dev.yml ps

# ログを確認
docker-compose -f docker-compose.dev.yml logs postgres
```

## 手動での起動方法

各サービスを個別に起動する場合：

1. インフラの起動
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. 各サービスを別々のターミナルで起動
```bash
# Terminal 1
cd services/team-service && pnpm dev

# Terminal 2
cd services/interaction-service && pnpm dev

# Terminal 3
cd services/gateway && pnpm dev

# Terminal 4
cd frontend/web-app && pnpm dev
```

## 動作確認

すべてのサービスが起動したら、以下のURLにアクセスして動作を確認：

- Web App: http://localhost:3000
- GraphQL Playground: http://localhost:4000/graphql
- Team Service Health: http://localhost:3001/health
- Interaction Service Health: http://localhost:3002/health

## リセット方法

問題が解決しない場合は、以下の手順でリセット：

```bash
# すべてのサービスを停止
docker-compose -f docker-compose.dev.yml down

# node_modulesとlockファイルを削除
rm -rf node_modules pnpm-lock.yaml
rm -rf services/*/node_modules
rm -rf frontend/*/node_modules

# 再インストール
pnpm install

# 再起動
./scripts/start-dev.sh
```