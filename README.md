# Team Topology Viewer

組織内のチーム間インタラクションを可視化・最適化するB2B向けSaaSツール

## 概要

Team Topologyの概念に基づいて、組織のチーム構造とその相互作用を管理・可視化することで、より効率的な組織設計を支援します。

## プロジェクト構成

```
.
├── frontend/               # フロントエンドアプリケーション
│   ├── web-app/           # メインWebアプリ (Remix)
│   └── admin-panel/       # 管理者向けパネル (Remix)
├── services/              # バックエンドマイクロサービス
│   ├── gateway/           # GraphQL Gateway (Apollo Server)
│   ├── team-service/      # チーム管理サービス (Hono)
│   ├── interaction-service/ # インタラクション管理サービス (Hono)
│   ├── analytics-service/   # 分析サービス (Hono)
│   ├── notification-service/ # 通知サービス (Hono)
│   └── user-service/        # ユーザー管理サービス (Hono)
├── infrastructure/        # インフラ設定
│   ├── docker/           # Docker設定
│   ├── kubernetes/       # Kubernetes設定
│   └── terraform/        # Terraformによるインフラ定義
├── docs/                 # ドキュメント
└── scripts/              # ユーティリティスクリプト
```

## 技術スタック

- **Frontend**: Remix, Apollo Client, Tailwind CSS, D3.js
- **Backend**: Hono, Apollo Server (GraphQL), PostgreSQL, Redis
- **Authentication**: Auth0
- **Infrastructure**: Docker, Kubernetes, AWS/GCP

## 開発環境のセットアップ

### 前提条件

- Node.js 20+
- Docker & Docker Compose
- pnpm

### 初回セットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env

# Dockerコンテナの起動
docker-compose up -d

# データベースマイグレーション
pnpm run db:migrate

# 開発サーバーの起動
pnpm run dev
```

## 開発コマンド

```bash
# 全サービスの起動
pnpm run dev

# テストの実行
pnpm run test

# Lintの実行
pnpm run lint

# 型チェック
pnpm run typecheck

# ビルド
pnpm run build
```

## ドキュメント

- [要件定義書](./REQUIREMENTS.md)
- [システムアーキテクチャ](./ARCHITECTURE.md)

## ライセンス

Proprietary
