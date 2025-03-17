FROM postgres:15

# Build 및 설치에 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-15

# pgvector 소스코드 클론 및 설치
RUN git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make && \
    make install

# 불필요한 빌드 도구 제거
RUN apt-get remove -y \
    build-essential \
    git \
    postgresql-server-dev-15 && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* /pgvector