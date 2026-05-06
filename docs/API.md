# CampusQ Backend – API Documentation

> **Stack:** Node.js · Express · PostgreSQL · JWT  
> **Base URL (dev):** `http://localhost:5000`

---

## Table of Contents

1. [Database Schema](#database-schema)
2. [Authentication](#authentication)
3. [Questions](#questions)
4. [Answers](#answers)
5. [Comments](#comments)
6. [Ratings & Points](#ratings--points)
7. [Leaderboards](#leaderboards)
8. [Tags & Interests](#tags--interests)
9. [Reports](#reports)
10. [Admin](#admin)
11. [Error Reference](#error-reference)
12. [Running Locally](#running-locally)

---

## Database Schema

The backend uses **9 PostgreSQL tables**. Run `server/schema.sql` on a fresh database (or `server/migration_v2.sql` on an existing one).

| Table | Description |
|---|---|
| `users` | Unified user store (student, lecturer, admin) |
| `questions` | Questions posted by users |
| `answers` | Answers to questions |
| `comments` | Comments on questions or answers |
| `tags` | Global tag library |
| `question_tags` | Many-to-many: questions ↔ tags |
| `user_interests` | Many-to-many: users ↔ tags (personalisation) |
| `ratings` | Star ratings given by question owners to answers |
| `reports` | User-submitted content reports |

### Key Constraints

- `comments` – CHECK ensures exactly one of `question_id` / `answer_id` is set.  
- `reports` – Same one-parent CHECK constraint.  
- `ratings` – UNIQUE on `(answer_id, rater_user_id)` prevents duplicate ratings.  
- `ratings.stars` – CHECK `BETWEEN 1 AND 5`.

---

## Authentication

All protected routes require a `Bearer` token in the `Authorization` header.

```
Authorization: Bearer <jwt_token>
```

The JWT payload is `{ id, nickname, role, is_active }`.

### `POST /api/auth/register`

Registers a new **student** or **lecturer**. Admin accounts cannot be self-registered.

**Request body:**
```json
{
  "email": "student@susl.ac.lk",
  "password": "securePassword123",
  "nickname": "AnonHawk",
  "role": "student"
}
```

> `role` must be `"student"` or `"lecturer"`.

**Success `201`:**
```json
{
  "message": "Registration successful.",
  "token": "<jwt>",
  "user": { "id": 1, "nickname": "AnonHawk", "role": "student" }
}
```

---

### `POST /api/auth/login`

**Request body:**
```json
{ "email": "student@susl.ac.lk", "password": "securePassword123" }
```

**Success `200`:**
```json
{
  "message": "Login successful.",
  "token": "<jwt>",
  "user": { "id": 1, "nickname": "AnonHawk", "role": "student", "is_active": true }
}
```

> Returns `403` with a clear message if the account is deactivated.

---

## Questions

### `POST /api/questions` 🔒

Create a question (student or lecturer only).

**Body:**
```json
{
  "title": "How does Big O notation work?",
  "body": "I'm confused about time complexity...",
  "tags": [1, 3]
}
```

`tags` is an array of existing tag IDs. All IDs are validated server-side.

**Success `201`:** Returns the created question object.

---

### `GET /api/questions`

Returns all non-hidden questions. Supports optional auth header for personalised ordering.

| Query Param | Type | Description |
|---|---|---|
| `search` | string | Keyword filter on title and body (ILIKE) |
| `tag_id` | integer | Filter to questions with this tag |

When the requester is authenticated and has saved interests, questions matching those tags appear first (`interest_score DESC`), then by recency.

**Success `200`:**
```json
{
  "questions": [
    {
      "id": 5,
      "title": "...",
      "author_nickname": "AnonHawk",
      "author_role": "student",
      "tags": ["algorithms", "data-structures"],
      "answer_count": 3,
      "interest_score": 2
    }
  ]
}
```

---

### `GET /api/questions/:id`

Returns a single question. Hidden questions are visible only to admins (optional auth).

**Success `200`:** Returns question with `tags`, `author_nickname`, `author_role`, `answer_count`.  
**`404`** if not found or hidden (for non-admins).

---

### `PUT /api/questions/:id` 🔒

Update a question. **Owner only.**

**Body (all optional, at least one required):**
```json
{ "title": "New title", "body": "Updated body", "tags": [2, 4] }
```

---

### `DELETE /api/questions/:id` 🔒

Delete a question. **Owner or admin.**

---

## Answers

### `POST /api/answers` 🔒

Post an answer (student or lecturer only). The question must exist and not be hidden.

**Body:**
```json
{ "question_id": 5, "body": "Big O describes worst-case complexity..." }
```

---

### `GET /api/answers/question/:questionId`

Returns all non-hidden answers for a question.

**Ordering:** accepted answer first → avg stars descending → created_at ascending.

**Response includes:** `author_nickname`, `author_role`, `avg_stars`, `rating_count`.

---

### `PUT /api/answers/:id` 🔒

Update answer body. **Owner only.**

---

### `DELETE /api/answers/:id` 🔒

Delete an answer. **Owner or admin.**

---

### `PATCH /api/answers/:id/accept` 🔒

Mark this answer as accepted. **Question owner only.**  
Automatically un-accepts any previously accepted answer on the same question.

---

## Comments

### `POST /api/comments` 🔒

Post a comment on a question or answer.

> ⚠️ **Role restriction:** Only **lecturers** can comment on answers. Both students and lecturers can comment on questions.

**Body:**
```json
{ "question_id": 5, "body": "Great question!" }
```
or
```json
{ "answer_id": 12, "body": "Minor correction: ..." }
```

Exactly one of `question_id` / `answer_id` must be provided.

---

### `GET /api/comments/question/:questionId`

Returns all comments on a question, ordered by `created_at ASC`. Includes `author_nickname` and `author_role`.

---

### `GET /api/comments/answer/:answerId`

Returns all comments on an answer, ordered by `created_at ASC`.

---

### `PUT /api/comments/:id` 🔒

Update comment body. **Owner only.**

---

### `DELETE /api/comments/:id` 🔒

Delete a comment. **Owner or admin.**

---

## Ratings & Points

The **question owner** rates answers they received. Stars (1–5) are added directly to the answer author's `users.points`.

### `POST /api/ratings` 🔒

**Restrictions:**
- Only the question owner can rate
- Cannot rate your own answer
- One rating per answer per rater (enforced by UNIQUE constraint + app-level check)

**Body:**
```json
{ "answer_id": 12, "stars": 4 }
```

**Success `201`:** `{ "message": "Rating submitted.", "stars": 4 }`

---

### `PUT /api/ratings/:id` 🔒

Update a rating. **Rater only.** Points are adjusted by the difference (`new - old`).

**Body:** `{ "stars": 5 }`

---

### `DELETE /api/ratings/:id` 🔒

Delete a rating. **Rater only.** Subtracts original stars from the user's points.

---

### `GET /api/ratings/answer/:answerId`

Returns the average star rating and total count for an answer.

**Response `200`:**
```json
{ "rating": { "avg_stars": "4.33", "total_ratings": "3" } }
```

---

## Leaderboards

### `GET /api/leaderboard/alltime`

Top 10 active users by total `points`. Fields: `rank`, `nickname`, `role`, `points`.

---

### `GET /api/leaderboard/monthly`

Top 10 users by sum of stars received **this calendar month** (based on `ratings.created_at`). Fields: `rank`, `nickname`, `role`, `monthly_points`.

---

## Tags & Interests

### `GET /api/tags`

Returns all tags (public).

**Response:** `{ "tags": [{ "id": 1, "name": "algorithms" }] }`

---

### `POST /api/tags` 🔒🛡️ *(admin only)*

Create a new tag. **Body:** `{ "name": "data-structures" }`

---

### `DELETE /api/tags/:id` 🔒🛡️ *(admin only)*

Delete a tag. Cascade-removes related `question_tags` and `user_interests` rows.

---

### `PUT /api/user/interests` 🔒

**Replaces** the authenticated user's entire preferred-tag set.

**Body:** `{ "tag_ids": [1, 3, 5] }` — all IDs are validated.

---

### `GET /api/user/interests` 🔒

Returns the authenticated user's current preferred tags.

---

## Reports

### `POST /api/reports` 🔒

Report a question or answer. Exactly one of `question_id` / `answer_id` must be supplied.

**Body:**
```json
{ "question_id": 5, "reason": "Contains offensive language." }
```

---

### `GET /api/reports` 🔒🛡️ *(admin only)*

Returns all **unresolved** reports, including reporter nickname, reported content preview, and reason.

---

### `PATCH /api/reports/:id/resolve` 🔒🛡️ *(admin only)*

Marks a report as resolved (`is_resolved = TRUE`).

---

## Admin

All `/api/admin/*` routes require authentication **and** admin role (`403` otherwise).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | All users with real identity (email, points, is_active) |
| `PATCH` | `/api/admin/users/:id/deactivate` | Deactivate a user (blocks login) |
| `PATCH` | `/api/admin/users/:id/reactivate` | Reactivate a user |
| `PATCH` | `/api/admin/questions/:id/hide` | Set `is_hidden = TRUE` on question |
| `PATCH` | `/api/admin/answers/:id/hide` | Set `is_hidden = TRUE` on answer |
| `DELETE` | `/api/admin/questions/:id` | Permanently delete question (cascade) |
| `DELETE` | `/api/admin/answers/:id` | Permanently delete answer |
| `DELETE` | `/api/admin/comments/:id` | Permanently delete comment |

---

## Error Reference

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request / missing fields / validation failure |
| `401` | No token provided |
| `403` | Invalid token, deactivated account, or insufficient role |
| `404` | Resource not found |
| `500` | Unexpected server error |

All error responses: `{ "message": "<descriptive string>" }`

---

## Running Locally

```bash
# 1. Set up .env
cp server/.env.example server/.env
# Fill in DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET

# 2. Create & seed the database
psql -U postgres -c "CREATE DATABASE campusq;"
psql -U postgres -d campusq -f server/schema.sql

# 3. Install dependencies
cd server && npm install

# 4. Start dev server
npm run dev
```

> 🔑 **Legend:** 🔒 = requires JWT · 🛡️ = requires admin role
