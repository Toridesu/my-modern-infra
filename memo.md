2 日目

・pakage.json あるけど
・docker desktop 起動していないとだめ！
・保存しないとコマンド失敗
・dockerfile修正　(るーとのpackage見てたっぽいい)
・dockeignore作成

解決策：アプリケーション用のフォルダを分ける
CDK のプロジェクトの中に、アプリケーション専用のフォルダを作成します。
現在のフォルダ構成はこうなっているはずです。
Generated code
my-fargate-project/
├── bin/
├── lib/
├── cdk.json
└── package.json <-- これは CDK 用なので触らない
Use code with caution.
これを以下のように変更します。
理想的なフォルダ構成
Generated code
my-fargate-project/
├── app/ <-- ★ アプリケーション用の新しいフォルダを作る
│ ├── app.js <-- アプリ本体はここ
│ └── package.json <-- ★ アプリ用の package.json はここ
│
├── bin/
├── lib/
├── Dockerfile <-- Dockerfile はルートに置く
├── cdk.json
└── package.json <-- CDK 用の package.json
Use code with caution.
この「インフラのコード」と「アプリケーションのコード」をフォルダで分離するのは、非常に一般的で良い習慣です。

より良くするための「プロの一工夫」
あなたの構成はすでに100点満点に近いですが、プロがさらにもう一手間加えるとしたら、という改善案を一つだけ提案します。
それは、.dockerignoreファイルを作成することです。
現状の小さな問題点
先ほどのdocker buildのログに、こんな一文がありました。
=> => transferring context: 194.58MB
これは、Dockerがビルドを始める前に、あなたのmy-modern-infraフォルダの中身（約195MB）を丸ごとDockerの作業領域にコピーしたことを示しています。
しかし、よく考えてみると、以下のフォルダはコンテナイメージに含める必要がありません。
app/node_modules/: アプリの依存関係。これはDockerfile内のRUN npm installでコンテナの中で作るので、ローカルのものをコピーする必要はありません。
ルートのnode_modules/: CDKの依存関係。これはコンテナに関係ありません。
cdk.out/: CDKが生成した中間ファイル。これもコンテナに関係ありません。
これらの不要なファイルをビルド対象から除外するのが.dockerignoreの役目です。
修正手順
プロジェクトのルートフォルダ（my-modern-infra）に、.dockerignoreという名前のファイルを新規作成します。（.gitignoreと同じ場所です）
そのファイルに、以下の内容を記述して保存します。
Generated code
# .dockerignore

# Git関連のファイル
.git
.gitignore

# CDK関連の不要なファイル
cdk.out
node_modules

# アプリのnode_modules (これが一番容量を食っている)
app/node_modules
