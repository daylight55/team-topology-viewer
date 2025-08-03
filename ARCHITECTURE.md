# Team Topology Viewer - システムアーキテクチャ

## 1. アーキテクチャ概要

### 1.1 全体構成
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Client    │     │  Mobile Client  │     │   Admin Panel   │
│    (Remix)      │     │   (Future)      │     │    (Remix)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                          ┌──────┴──────┐
                          │   GraphQL   │
                          │   Gateway   │
                          │   (Apollo)  │
                          └──────┬──────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────┴────────┐     ┌───────┴────────┐     ┌───────┴────────┐
│  Team Service   │     │  Interaction   │     │  Analytics     │
│    (Hono)       │     │   Service      │     │   Service      │
│                 │     │    (Hono)      │     │    (Hono)      │
└────────┬────────┘     └───────┬────────┘     └───────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                          ┌──────┴──────┐
                          │ PostgreSQL  │
                          │  + Redis    │
                          └─────────────┘
```

### 1.2 技術スタック

#### Frontend
- **Framework**: Remix v2
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: Remix loaders/actions + Zustand (for client state)
- **GraphQL Client**: Apollo Client
- **Visualization**: D3.js / Cytoscape.js
- **Testing**: Vitest + Testing Library

#### Backend
- **API Gateway**: Apollo Server (GraphQL)
- **Microservices**: Hono (on Node.js)
- **Authentication**: Auth0
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Message Queue**: RabbitMQ
- **Monitoring**: OpenTelemetry + Prometheus
- **Container**: Docker + Docker Compose

#### Infrastructure
- **Container Orchestration**: Kubernetes (Production)
- **CI/CD**: GitHub Actions
- **Cloud Provider**: AWS / GCP (multi-cloud ready)
- **CDN**: CloudFlare

## 2. マイクロサービス設計

### 2.1 サービス一覧

#### Team Service
- チーム情報の管理
- メンバー管理
- チームタイプと属性の管理
- 認知負荷の計算と追跡

#### Interaction Service
- インタラクションの定義と管理
- インタラクションモードの管理
- 時系列データの保存
- インタラクション変更履歴

#### Analytics Service
- メトリクスの計算
- レポート生成
- 異常検知とアラート
- レコメンデーション生成

#### Notification Service
- イベント通知
- メール送信
- Webhook連携
- リアルタイム通知（WebSocket）

#### User Service
- ユーザー管理
- 権限管理
- Auth0連携
- 組織・テナント管理

### 2.2 サービス間通信
- **同期通信**: GraphQL (Apollo Federation)
- **非同期通信**: RabbitMQ
- **サービスディスカバリ**: Consul / Kubernetes Service

## 3. データベース設計

### 3.1 データ分割戦略
- **Team Service DB**: teams, team_members, team_domains
- **Interaction Service DB**: interactions, interaction_history
- **Analytics Service DB**: metrics, reports, recommendations
- **User Service DB**: users, organizations, permissions

### 3.2 キャッシュ戦略
- **Redis**: セッション管理、頻繁にアクセスされるデータ
- **CDN**: 静的アセット、可視化データ
- **Application Cache**: 計算結果のキャッシュ

## 4. セキュリティアーキテクチャ

### 4.1 認証・認可
```
┌─────────┐     ┌─────────┐     ┌─────────────┐
│ Client  │────▶│  Auth0  │────▶│   Gateway   │
└─────────┘     └─────────┘     └──────┬──────┘
                                       │
                                ┌──────┴──────┐
                                │   Services  │
                                │  (JWT検証)  │
                                └─────────────┘
```

### 4.2 セキュリティ対策
- **ネットワーク**: VPC, Security Groups, WAF
- **API**: Rate Limiting, CORS, CSP
- **データ**: 暗号化（TLS, AES-256）
- **監査**: アクセスログ、操作ログ

## 5. スケーラビリティ設計

### 5.1 水平スケーリング
- サービスごとの独立したスケーリング
- ロードバランサーによる負荷分散
- データベースのRead Replica

### 5.2 パフォーマンス最適化
- GraphQL DataLoader
- N+1問題の回避
- バッチ処理とキューイング
- CDNとエッジキャッシング

## 6. 開発環境

### 6.1 ローカル開発
- Docker Composeによる全サービス起動
- Hot Reloadingサポート
- ローカルAuth0テナント
- Seedデータの自動投入

### 6.2 CI/CD パイプライン
```
[Push] → [Lint/Test] → [Build] → [Security Scan] → [Deploy to Staging] → [E2E Test] → [Deploy to Production]
```

## 7. モニタリング・運用

### 7.1 観測性
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack
- **Tracing**: Jaeger
- **APM**: Datadog / New Relic

### 7.2 アラート
- サービスダウン検知
- パフォーマンス劣化
- エラー率上昇
- リソース使用率