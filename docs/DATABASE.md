# CampusQ Backend – Database Schema Reference

> **Engine:** PostgreSQL  
> **Schema file:** `server/schema.sql` (fresh install)  
> **Migration file:** `server/migration_v2.sql` (existing DB upgrade)

---

## Entity-Relationship Overview

```
users ────────────────────────────────────────────────────────────────┐
  │                                                                    │
  ├── questions (user_id → users.id)                                   │
  │     ├── answers (question_id → questions.id)                       │
  │     │     ├── comments (answer_id → answers.id) ──── users         │
  │     │     ├── ratings  (answer_id → answers.id)                    │
  │     │     │     ├── rater_user_id → users.id                       │
  │     │     │     └── rated_user_id → users.id                       │
  │     │     └── reports (answer_id → answers.id) ─── users           │
  │     ├── comments (question_id → questions.id) ──── users           │
  │     ├── question_tags (question_id, tag_id)                        │
  │     └── reports (question_id → questions.id) ─── users             │
  └── user_interests (user_id, tag_id)                                 │
                                                                        │
tags ─────────────────────────────────────────────────────────────────┘
  ├── question_tags (tag_id)
  └── user_interests (tag_id)
```

---

## Table Definitions

### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | NOT NULL (bcrypt hash) |
| `nickname` | VARCHAR(50) | UNIQUE, NOT NULL |
| `role` | VARCHAR(20) | NOT NULL, CHECK IN ('student','lecturer','admin') |
| `points` | INTEGER | NOT NULL, DEFAULT 0 |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

---

### `questions`

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `user_id` | INTEGER | NOT NULL, FK → users(id) CASCADE |
| `title` | VARCHAR(255) | NOT NULL |
| `body` | TEXT | NOT NULL |
| `is_hidden` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

---

### `answers`

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `question_id` | INTEGER | NOT NULL, FK → questions(id) CASCADE DELETE |
| `user_id` | INTEGER | NOT NULL, FK → users(id) CASCADE DELETE |
| `body` | TEXT | NOT NULL |
| `is_accepted` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `is_hidden` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

---

### `comments`

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `user_id` | INTEGER | NOT NULL, FK → users(id) CASCADE |
| `question_id` | INTEGER | NULLABLE, FK → questions(id) CASCADE |
| `answer_id` | INTEGER | NULLABLE, FK → answers(id) CASCADE |
| `body` | TEXT | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**CHECK constraint** `comments_one_parent`:  
```sql
(question_id IS NOT NULL)::int + (answer_id IS NOT NULL)::int = 1
```

---

### `tags`

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(80) | UNIQUE, NOT NULL |

---

### `question_tags`

| Column | Type | Constraints |
|---|---|---|
| `question_id` | INTEGER | FK → questions(id) CASCADE |
| `tag_id` | INTEGER | FK → tags(id) CASCADE |
| — | — | PRIMARY KEY (question_id, tag_id) |

---

### `user_interests`

| Column | Type | Constraints |
|---|---|---|
| `user_id` | INTEGER | FK → users(id) CASCADE |
| `tag_id` | INTEGER | FK → tags(id) CASCADE |
| — | — | PRIMARY KEY (user_id, tag_id) |

---

### `ratings`

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `question_id` | INTEGER | NOT NULL, FK → questions(id) CASCADE |
| `answer_id` | INTEGER | NOT NULL, FK → answers(id) CASCADE |
| `rater_user_id` | INTEGER | NOT NULL, FK → users(id) CASCADE (question owner) |
| `rated_user_id` | INTEGER | NOT NULL, FK → users(id) CASCADE (answer author) |
| `stars` | INTEGER | NOT NULL, CHECK BETWEEN 1 AND 5 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**UNIQUE constraint:** `(answer_id, rater_user_id)` — prevents duplicate ratings.

---

### `reports`

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `reporter_user_id` | INTEGER | NOT NULL, FK → users(id) CASCADE |
| `question_id` | INTEGER | NULLABLE, FK → questions(id) CASCADE |
| `answer_id` | INTEGER | NULLABLE, FK → answers(id) CASCADE |
| `reason` | TEXT | NOT NULL |
| `is_resolved` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**CHECK constraint** `reports_one_target`:  
```sql
(question_id IS NOT NULL)::int + (answer_id IS NOT NULL)::int = 1
```

---

## Indexes

| Index Name | Table | Column(s) | Purpose |
|---|---|---|---|
| `idx_questions_user_id` | questions | user_id | FK lookup |
| `idx_answers_question_id` | answers | question_id | FK / feed queries |
| `idx_answers_user_id` | answers | user_id | FK lookup |
| `idx_comments_user_id` | comments | user_id | FK lookup |
| `idx_comments_question_id` | comments | question_id | Comment retrieval |
| `idx_comments_answer_id` | comments | answer_id | Comment retrieval |
| `idx_question_tags_tag_id` | question_tags | tag_id | Tag filter |
| `idx_user_interests_tag_id` | user_interests | tag_id | Interest join |
| `idx_ratings_answer_id` | ratings | answer_id | Avg-star queries |
| `idx_ratings_rater_user_id` | ratings | rater_user_id | FK lookup |
| `idx_ratings_rated_user_id` | ratings | rated_user_id | Points queries |
| `idx_ratings_created_at` | ratings | created_at | Monthly leaderboard |
| `idx_reports_reporter_id` | reports | reporter_user_id | FK lookup |
| `idx_reports_question_id` | reports | question_id | FK lookup |
| `idx_reports_answer_id` | reports | answer_id | FK lookup |

---

## Migration Notes (v1 → v2)

The original schema used separate `students` and `lecturers` tables.  
**v2** consolidates them into a single `users` table with a `role` column.

Other renamed/rebuilt tables:

| Old name | New name | Change |
|---|---|---|
| `answer_ratings` | `ratings` | Added `question_id`, `rated_user_id`; renamed `rating` → `stars` |
| `user_tag_preferences` | `user_interests` | Removed `user_role` column (role now in `users`) |
| `reports` | `reports` | Replaced `target_type/target_id` with dedicated `question_id`/`answer_id` FKs + `is_resolved` |
