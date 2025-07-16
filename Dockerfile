# 1. 設計図のベースを選ぶ
FROM node:18-alpine

# 2. コンテナの中に作業用のフォルダを作る
WORKDIR /usr/src/app

# 3. アプリケーション用のpackage.jsonをコピーして、部品をインストールする
#    コピー元を ./app/ にすることで、アプリ用のものだけを対象にする
COPY ./app/package*.json ./
RUN npm install

# 4. アプリケーションのソースコードを全部コピーする
#    ./app/ の中身を、コンテナの作業ディレクトリにコピーする
COPY ./app/ ./

# 5. ポートを公開する
EXPOSE 8080

# 6. コンテナ起動時に実行するコマンド
CMD [ "node", "app.js" ]