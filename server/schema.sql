-- =============================================================
-- CampusQ – Complete Database Schema (canonical, v2)
-- Run this on a FRESH database. For an existing DB use
-- migration_v2.sql instead.
-- =============================================================

-- ── 1. USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    email               VARCHAR(150) UNIQUE NOT NULL,
    password            VARCHAR(255) NOT NULL,
    nickname            VARCHAR(50)  UNIQUE NOT NULL,
    role                VARCHAR(20)  NOT NULL CHECK (role IN ('student','lecturer','admin')),
    registration_number VARCHAR(100),
    is_approved         BOOLEAN      NOT NULL DEFAULT FALSE,
    points              INTEGER      NOT NULL DEFAULT 0,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. QUESTIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    body        TEXT         NOT NULL,
    is_hidden   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. ANSWERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS answers (
    id          SERIAL PRIMARY KEY,
    question_id INTEGER      NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body        TEXT         NOT NULL,
    is_accepted BOOLEAN      NOT NULL DEFAULT FALSE,
    is_hidden   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 4. COMMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER      REFERENCES questions(id) ON DELETE CASCADE,
    answer_id   INTEGER      REFERENCES answers(id)   ON DELETE CASCADE,
    body        TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Exactly one of question_id / answer_id must be set
    CONSTRAINT comments_one_parent CHECK (
        (question_id IS NOT NULL)::int + (answer_id IS NOT NULL)::int = 1
    )
);

-- ── 5. TAGS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL
);

-- ── 6. QUESTION_TAGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_tags (
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    tag_id      INTEGER NOT NULL REFERENCES tags(id)      ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

-- ── 7. USER_INTERESTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_interests (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_id)
);

-- ── 8. RATINGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
    id             SERIAL PRIMARY KEY,
    question_id    INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_id      INTEGER NOT NULL REFERENCES answers(id)   ON DELETE CASCADE,
    rater_user_id  INTEGER NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    rated_user_id  INTEGER NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    stars          INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- One rating per answer per rater
    UNIQUE (answer_id, rater_user_id)
);

-- ── 9. REPORTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    id               SERIAL PRIMARY KEY,
    reporter_user_id INTEGER NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    question_id      INTEGER          REFERENCES questions(id) ON DELETE CASCADE,
    answer_id        INTEGER          REFERENCES answers(id)   ON DELETE CASCADE,
    reason           TEXT    NOT NULL,
    is_resolved      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Exactly one of question_id / answer_id must be set
    CONSTRAINT reports_one_target CHECK (
        (question_id IS NOT NULL)::int + (answer_id IS NOT NULL)::int = 1
    )
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_questions_user_id       ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id     ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id         ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id        ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_question_id    ON comments(question_id);
CREATE INDEX IF NOT EXISTS idx_comments_answer_id      ON comments(answer_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id    ON question_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_tag_id   ON user_interests(tag_id);
CREATE INDEX IF NOT EXISTS idx_ratings_answer_id       ON ratings(answer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_user_id   ON ratings(rater_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id   ON ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at      ON ratings(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id     ON reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_question_id     ON reports(question_id);
CREATE INDEX IF NOT EXISTS idx_reports_answer_id       ON reports(answer_id);
