# AWS CDK & Fargate: Modern Web Application Infrastructure

このプロジェクトは、AIから提示された1週間の学習課題「【脱・EC2職人】コンテナ(Fargate)とIaC(CDK)で構築するモダンWebアプリケーション基盤」を達成した記録です。

従来のEC2ベースのインフラ構築から脱却し、**Infrastructure as Code (IaC)**、**サーバーレス**、**コンテナ**といったクラウドネイティブ技術を駆使して、スケーラブルで保守性の高いWebアプリケーション基盤をゼロから構築しました。

## 構築したシステムの構成図

[ここに構成図の画像を挿入]

*(例: PowerPointやdraw.io、Figmaなどで作成した構成図のスクリーンショットを貼り付けます)*

## ✨ このプロジェクトの主な特徴

*   **Infrastructure as Code (IaC)**
    *   AWSのコンソール画面を一切使用せず、全てのインフラリソースを**AWS CDK (TypeScript)** を用いてコードで定義。これにより、インフラのバージョン管理、レビュー、自動化、そして何度でも同じ環境をミスなく再現する能力を獲得しました。

*   **サーバーレス・コンピューティング**
    *   コンテナの実行環境として**AWS Fargate**を採用。EC2インスタンスのようなサーバー自体の管理（OSのパッチ適用、スケーリングなど）から完全に解放され、アプリケーションの価値向上に集中できるアーキテクチャを実現しました。

*   **コンテナ技術の活用**
    *   アプリケーションを**Docker**でコンテナ化。「自分のPCでは動いたのに...」という環境差異の問題を根本から解決し、開発から本番まで一貫した動作を保証します。コンテナイメージは**Amazon ECR**で安全に管理されます。

*   **スケーラビリティと高可用性**
    *   **Application Load Balancer (ALB)** を用いてトラフィックを分散。さらにCPU使用率に応じた**Auto Scaling**設定により、負荷に応じてコンテナ数を自動で増減させ、安定したサービス提供とコスト効率を両立します。
    *   リソースは複数のアベイラビリティゾーン (Multi-AZ) にまたがって展開され、単一障害点のない高い可用性を確保しています。

## 🛠️ 使用技術スタック

| カテゴリ | 技術・サービス |
| :--- | :--- |
| **IaC** | AWS CDK (TypeScript) |
| **コンテナ** | Docker, Amazon ECR |
| **コンピューティング** | AWS Fargate |
| **ネットワーキング** | Amazon VPC, Application Load Balancer (ALB) |
| **言語 & ツール** | Node.js, TypeScript, Git, npm |

## 🚀 プロジェクトの実行手順

1.  **前提条件のインストール**
    *   AWS CLI
    *   Node.js (v18以降)
    *   Docker Desktop
    *   AWS CDK

2.  **AWS認証情報の設定**
    ```bash
    aws configure
    ```

3.  **CDKの初回準備 (Bootstrap)**
    対象のAWSアカウントとリージョンで初めてCDKを使う場合に一度だけ実行します。
    ```bash
    cdk bootstrap
    ```

4.  **アプリケーションのコンテナ化とプッシュ**
    ```bash
    # 依存関係のインストール (appフォルダ内で)
    cd app
    npm install
    cd ..

    # Dockerイメージのビルド
    docker build -t my-fargate-app .

    # ECRへのログインとプッシュ
    aws ecr get-login-password ... | docker login ...
    docker tag my-fargate-app:latest YOUR_ECR_REPOSITORY_URI:latest
    docker push YOUR_ECR_REPOSITORY_URI:latest
    ```

5.  **インフラのデプロイ**
    ```bash
    cdk deploy
    ```
    デプロイ完了後、Outputsに表示される`LoadBalancerDNS`のURLにアクセスします。

6.  **クリーンアップ**
    作成したすべてのリソースを完全に削除します。
    ```bash
    cdk destroy
    ```

## フォルダ構成

インフラのコードとアプリケーションのコードを明確に分離する構成を採用しています。

```
my-modern-infra/
├── app/               # Node.jsアプリケーションのソースコード
│   ├── app.js
│   └── package.json
│
├── lib/               # CDKスタックの定義 (インフラのメイン設計図)
│   └── my-modern-infra-stack.ts
│
├── bin/               # CDKアプリケーションのエントリーポイント
├── Dockerfile         # アプリケーションをコンテナ化するための定義
├── .dockerignore      # Dockerビルド時に不要なファイルを除外
├── cdk.json           # CDKの設定ファイル
└── package.json       # CDKプロジェクト自体の依存関係
```

## 💡 学びと乗り越えた課題

この1週間の挑戦を通じて、数々のエラーと向き合い、実践的な知識を習得しました。

*   **Dockerfileのパス問題**: インフラとアプリのコードを分離したことにより、`Dockerfile`の`COPY`命令が意図通りに機能しない問題に直面。ビルドコンテキストとパス指定の重要性を学びました。
*   **コンテナ起動失敗とログ調査**: `docker run`は成功するのにコンテナに接続できない問題に対し、`docker logs`を使ってコンテナ内部のエラーを特定・解決する、基本的なトラブルシューティング手法を体得しました。
*   **IaCの状態管理**: `cdk deploy`時に「リソースが既に存在する」というエラーに遭遇。CDKが管理するリソースの状態と、実際のAWS上のリソース状態を一致させることの重要性を理解しました。
*   **Fargateのヘルスチェック**: `desiredCount`を2にしてもタスクが増えない問題は、ALBのヘルスチェックが原因でした。`healthCheckGracePeriod`を設定することで、コンテナ起動直後の不安定な期間を許容する必要があることを学びました。

このプロジェクトは、私にとってクラウドネイティブ技術への大きな一歩となりました。