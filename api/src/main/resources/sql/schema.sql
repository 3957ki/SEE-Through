-- pgvector 익스텐션 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 모든 테이블 및 사용자 정의 타입 삭제
DO
$$
    DECLARE
        r RECORD;
    BEGIN
        -- 모든 테이블 삭제
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema())
            LOOP
                EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;

        -- 모든 사용자 정의 타입 삭제 (ENUM 포함)
        FOR r IN (SELECT typname
                  FROM pg_type t
                           JOIN pg_namespace n ON t.typnamespace = n.oid
                  WHERE n.nspname = current_schema()
                    AND t.typtype = 'e')
            LOOP
                EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
            END LOOP;

        -- 모든 인덱스 삭제
        FOR r IN (SELECT indexname FROM pg_indexes WHERE schemaname = current_schema())
            LOOP
                EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.indexname) || ' CASCADE';
            END LOOP;
    END
$$;

-- 구성원 테이블
CREATE TABLE members
(
    member_id         VARCHAR(36) NOT NULL,
    name              VARCHAR(15) NOT NULL DEFAULT '???',
    birth             DATE,
    age               INTEGER     NOT NULL,
    image_path        TEXT        NOT NULL,
    color             TEXT        NOT NULL DEFAULT 'bg-orange-400',
    font_size         TEXT        NOT NULL DEFAULT 'text-sm',
    preferred_foods   JSONB       NOT NULL DEFAULT '[]'::JSONB,
    disliked_foods    JSONB       NOT NULL DEFAULT '[]'::JSONB,
    allergies         JSONB       NOT NULL DEFAULT '[]'::JSONB,
    diseases          JSONB       NOT NULL DEFAULT '[]'::JSONB,
    is_registered     BOOLEAN     NOT NULL DEFAULT FALSE,
    is_monitored      BOOLEAN     NOT NULL DEFAULT FALSE,
    recognition_times INTEGER     NOT NULL DEFAULT 0,
    last_login_at     TIMESTAMP,
    created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at        TIMESTAMP,

    PRIMARY KEY (member_id)
);

-- 냉장고 식재료 테이블
CREATE TABLE ingredients
(
    ingredient_id    VARCHAR(36) NOT NULL,
    name             TEXT        NOT NULL,
    image_path       TEXT        NOT NULL,
    member_id        VARCHAR(36) NOT NULL,
    inbound_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiration_at    TIMESTAMP,
    embedding_vector VECTOR(1536),

    PRIMARY KEY (ingredient_id),
    FOREIGN KEY (member_id) REFERENCES members (member_id)
);

CREATE INDEX ON ingredients USING HNSW (embedding_vector vector_cosine_ops);

-- 냉장고 로그 입출고 ENUM
CREATE TYPE MOVEMENT_TYPE AS ENUM ('INBOUND', 'OUTBOUND');

-- 냉장고 로그 테이블
CREATE TABLE ingredient_logs
(
    ingredient_log_id     VARCHAR(36)   NOT NULL,
    ingredient_name       TEXT          NOT NULL,
    ingredient_image_path TEXT          NOT NULL,
    member_id             VARCHAR(36)   NOT NULL,
    movement_type         MOVEMENT_TYPE NOT NULL,
    created_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    embedding_vector      VECTOR(1536),

    PRIMARY KEY (ingredient_log_id),
    FOREIGN KEY (member_id) REFERENCES members (member_id)
);

CREATE INDEX ON ingredient_logs USING HNSW (embedding_vector vector_cosine_ops);

-- 경고 테이블
CREATE TABLE alerts
(
    member_id     VARCHAR(36) NOT NULL,
    ingredient_id VARCHAR(36) NOT NULL,
    comment       TEXT        NOT NULL,
    is_danger     BOOLEAN     NOT NULL DEFAULT TRUE,

    PRIMARY KEY (member_id, ingredient_id),
    FOREIGN KEY (member_id) REFERENCES members (member_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients (ingredient_id)
);

CREATE TYPE SERVING_TIME AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- 식단 테이블
CREATE TABLE meals
(
    meal_id      VARCHAR(36)  NOT NULL,
    member_id    VARCHAR(36)  NOT NULL,
    serving_date DATE         NOT NULL,
    serving_time SERVING_TIME NOT NULL,
    menu         JSONB        NOT NULL DEFAULT '[]'::JSONB,
    reason       TEXT,

    PRIMARY KEY (meal_id),
    FOREIGN KEY (member_id) REFERENCES members (member_id),
    UNIQUE (member_id, serving_date, serving_time)
);