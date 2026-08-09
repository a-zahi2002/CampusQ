-- =============================================================
-- CampusQ – Migration v2 (old schema → new unified schema)
-- Run once on existing database. Safe to re-run (idempotent).
-- =============================================================

-- ── STEP 1: Create new unified users table ───────────────────
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    email               VARCHAR(150) UNIQUE NOT NULL,
    password            VARCHAR(255) NOT NULL,
    nickname            VARCHAR(50)  UNIQUE NOT NULL,
    role                VARCHAR(20)  NOT NULL CHECK (role IN ('student','lecturer','admin')),
    registration_number VARCHAR(100),
    is_approved         BOOLEAN      NOT NULL DEFAULT TRUE,
    points              INTEGER      NOT NULL DEFAULT 0,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── STEP 2: Migrate students → users ─────────────────────────
INSERT INTO users (email, password, nickname, role, points, is_active, created_at)
SELECT email, password, nickname, 'student',
       COALESCE(points, 0),
       COALESCE(is_active, TRUE),
       created_at
FROM students
ON CONFLICT (email) DO NOTHING;

-- ── STEP 3: Migrate lecturers → users ────────────────────────
INSERT INTO users (email, password, nickname, role, points, is_active, created_at)
SELECT email, password, nickname, 'lecturer',
       COALESCE(points, 0),
       COALESCE(is_active, TRUE),
       created_at
FROM lecturers
ON CONFLICT (email) DO NOTHING;

-- ── STEP 4: Rename old questions table, rebuild with new schema ──
ALTER TABLE questions RENAME TO questions_old;

CREATE TABLE IF NOT EXISTS questions (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    body        TEXT         NOT NULL,
    is_hidden   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── STEP 5: Migrate old question data ────────────────────────
INSERT INTO questions (id, user_id, title, body, is_hidden, created_at, updated_at)
SELECT qo.question_id,
       u.id,
       qo.title,
       COALESCE(qo.description, ''),
       COALESCE(qo.is_hidden, FALSE),
       qo.created_at,
       qo.created_at
FROM questions_old qo
JOIN users u ON u.nickname = (
    SELECT COALESCE(s.nickname, l.nickname)
    FROM students s
    FULL OUTER JOIN lecturers l ON FALSE
    WHERE (qo.author_role = 'student' AND s.student_id = qo.author_id)
       OR (qo.author_role = 'lecturer' AND l.lecturer_id = qo.author_id)
    LIMIT 1
);

SELECT setval('questions_id_seq', (SELECT COALESCE(MAX(id),1) FROM questions));

-- ── STEP 6: Rebuild answers ───────────────────────────────────
ALTER TABLE answers RENAME TO answers_old;

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

INSERT INTO answers (id, question_id, user_id, body, is_accepted, is_hidden, created_at, updated_at)
SELECT ao.answer_id, ao.question_id, u.id,
       COALESCE(ao.content, ''),
       COALESCE(ao.is_accepted, FALSE),
       COALESCE(ao.is_hidden, FALSE),
       ao.created_at, ao.created_at
FROM answers_old ao
JOIN users u ON u.nickname = (
    SELECT COALESCE(s.nickname, l.nickname)
    FROM students s
    FULL OUTER JOIN lecturers l ON FALSE
    WHERE (ao.author_role = 'student' AND s.student_id = ao.author_id)
       OR (ao.author_role = 'lecturer' AND l.lecturer_id = ao.author_id)
    LIMIT 1
);

SELECT setval('answers_id_seq', (SELECT COALESCE(MAX(id),1) FROM answers));

-- ── STEP 7: Rebuild comments ──────────────────────────────────
ALTER TABLE comments RENAME TO comments_old;

CREATE TABLE IF NOT EXISTS comments (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER      REFERENCES questions(id) ON DELETE CASCADE,
    answer_id   INTEGER      REFERENCES answers(id)   ON DELETE CASCADE,
    body        TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comments_one_parent CHECK (
        (question_id IS NOT NULL)::int + (answer_id IS NOT NULL)::int = 1
    )
);

INSERT INTO comments (id, user_id, question_id, answer_id, body, created_at, updated_at)
SELECT co.comment_id, u.id,
       CASE WHEN co.parent_type = 'question' THEN co.parent_id END,
       CASE WHEN co.parent_type = 'answer'   THEN co.parent_id END,
       COALESCE(co.content, ''),
       co.created_at, co.created_at
FROM comments_old co
JOIN users u ON u.nickname = (
    SELECT COALESCE(s.nickname, l.nickname)
    FROM students s
    FULL OUTER JOIN lecturers l ON FALSE
    WHERE (co.author_role = 'student' AND s.student_id = co.author_id)
       OR (co.author_role = 'lecturer' AND l.lecturer_id = co.author_id)
    LIMIT 1
);

SELECT setval('comments_id_seq', (SELECT COALESCE(MAX(id),1) FROM comments));

-- ── STEP 8: Rebuild tags ──────────────────────────────────────
-- Rename old tag columns to new names
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tags' AND column_name='tag_id') THEN
        ALTER TABLE tags RENAME COLUMN tag_id TO id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tags' AND column_name='tag_name') THEN
        ALTER TABLE tags RENAME COLUMN tag_name TO name;
    END IF;
END $$;

-- ── STEP 9: question_tags – keep as is (columns already correct) ──
-- nothing needed if question_tags refs questions(question_id) → questions(id)
-- Recreate FK references after rename:
ALTER TABLE question_tags DROP CONSTRAINT IF EXISTS question_tags_tag_id_fkey;
ALTER TABLE question_tags ADD CONSTRAINT question_tags_tag_id_fkey
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;
ALTER TABLE question_tags DROP CONSTRAINT IF EXISTS question_tags_question_id_fkey;
ALTER TABLE question_tags ADD CONSTRAINT question_tags_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

-- ── STEP 10: user_interests (was user_tag_preferences) ────────
CREATE TABLE IF NOT EXISTS user_interests (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_id)
);

INSERT INTO user_interests (user_id, tag_id)
SELECT u.id, utp.tag_id
FROM user_tag_preferences utp
JOIN users u ON u.id = (
    SELECT us.id FROM users us
    WHERE us.role = utp.user_role
    LIMIT 1  -- best-effort; actual join may need nickname map
)
ON CONFLICT DO NOTHING;

-- ── STEP 11: ratings (was answer_ratings) ─────────────────────
CREATE TABLE IF NOT EXISTS ratings (
    id             SERIAL PRIMARY KEY,
    question_id    INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_id      INTEGER NOT NULL REFERENCES answers(id)   ON DELETE CASCADE,
    rater_user_id  INTEGER NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    rated_user_id  INTEGER NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    stars          INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (answer_id, rater_user_id)
);

-- ── STEP 12: reports – rebuild with new FK schema ─────────────
ALTER TABLE reports RENAME TO reports_old;

CREATE TABLE IF NOT EXISTS reports (
    id               SERIAL PRIMARY KEY,
    reporter_user_id INTEGER NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    question_id      INTEGER          REFERENCES questions(id) ON DELETE CASCADE,
    answer_id        INTEGER          REFERENCES answers(id)   ON DELETE CASCADE,
    reason           TEXT    NOT NULL,
    is_resolved      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reports_one_target CHECK (
        (question_id IS NOT NULL)::int + (answer_id IS NOT NULL)::int = 1
    )
);

INSERT INTO reports (id, reporter_user_id, question_id, answer_id, reason, is_resolved, created_at)
SELECT ro.report_id, u.id,
       CASE WHEN ro.target_type = 'question' THEN ro.target_id END,
       CASE WHEN ro.target_type = 'answer'   THEN ro.target_id END,
       ro.reason,
       FALSE,
       ro.created_at
FROM reports_old ro
JOIN users u ON u.id = (
    SELECT us.id FROM users us
    WHERE us.role = ro.reporter_role
    LIMIT 1
);

SELECT setval('reports_id_seq', (SELECT COALESCE(MAX(id),1) FROM reports));

-- ── STEP 13: Indexes ──────────────────────────────────────────
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
