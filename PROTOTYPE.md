# Team Topology Viewer - プロトタイプ

## 概要

このプロトタイプは、Team Topologyの概念に基づいてチーム間のインタラクションを定義し、可視化できる基本的な機能を実装しています。

## 実装済み機能

### 1. チーム管理
- チームの作成（4つのチームタイプ：Stream-aligned, Platform, Enabling, Complicated Subsystem）
- チーム情報の表示（名前、タイプ、説明、認知負荷）
- チーム一覧表示

### 2. インタラクション定義
- チーム間のインタラクション作成
- 3つのインタラクションモード（Collaboration, X-as-a-Service, Facilitating）
- インタラクションの強度設定（高/中/低）
- 期間設定（一時的/恒常的）
- インタラクション一覧表示

### 3. 可視化
- Cytoscapeを使用したグラフ表示
- チームタイプ別の色分け
- インタラクションモード別の線種表示
- インタラクションの健全性チェック（恒常的なCollaborationの警告）

## 開発環境の起動方法

### 方法1: 自動起動（推奨）
```bash
# 1. 環境変数の設定（初回のみ）
cp .env.example .env

# 2. 開発環境の起動
./scripts/start-dev.sh
```

### 方法2: 手動起動
```bash
# 1. インフラのみ起動
./scripts/start-dev-simple.sh

# 2. 各サービスを個別のターミナルで起動
# Terminal 1: cd services/team-service && pnpm dev
# Terminal 2: cd services/interaction-service && pnpm dev
# Terminal 3: cd services/gateway && pnpm dev
# Terminal 4: cd frontend/web-app && pnpm dev
```

### トラブルシューティング
- `concurrently`がインストールされていない場合は `pnpm install` を実行
- Dockerが起動していることを確認
- ポートが使用されていないことを確認（3000, 3001, 3002, 4000, 5432, 6379）

## アクセスURL

起動後、以下のURLでアクセスできます：

- **Web App**: http://localhost:3000
- **GraphQL Playground**: http://localhost:4000/graphql
- **RabbitMQ Management**: http://localhost:15672 (ttv_user/ttv_password)

## 使い方

### 1. チームの作成
1. トップページから「チーム一覧へ」をクリック
2. 「チームを追加」ボタンをクリック
3. チーム名、チームタイプを選択して作成

### 2. インタラクションの定義
1. トップページから「インタラクション一覧へ」をクリック
2. 「インタラクションを追加」ボタンをクリック
3. 2つのチームを選択し、インタラクションモードを設定

### 3. 可視化の確認
1. トップページから「可視化ページへ」をクリック
2. チーム間の関係がグラフで表示されます
3. 下部に健全性チェックの結果が表示されます

## プロトタイプの制限事項

- 認証機能は未実装（モック組織IDを使用）
- ユーザー管理機能は未実装
- データの永続化は開発環境のみ
- 一部のサービス（Analytics, Notification, User）は基本実装のみ

## 今後の拡張予定

- Auth0による認証実装
- マルチテナント対応
- 詳細な分析機能
- レポート生成機能
- WebSocketによるリアルタイム更新