FROM python:3.9-slim-buster

# 必要なパッケージをインストールする
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 必要なPythonパッケージをインストールする
RUN pip install --no-cache-dir \
    Flask \
    requests \
    flask-cors \
    langchain \
    google-search-results \
    openai

# ポート番号を公開する
EXPOSE 5000
