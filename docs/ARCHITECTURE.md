# CampusQ Backend – Architecture & Developer Guide

> This document describes the backend architecture, security design decisions, and contribution guidelines for the CampusQ Node.js/Express/PostgreSQL server.

---

## Project Structure

```
server/
├── src/
│   ├── index.js                  # Entry point — middleware, route registration
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification → req.user
│   │   └── adminMiddleware.js    # isAdmin RBAC guard
│   ├── controllers/
│   │   ├── authController.js     # register, login
│   │   ├── questionController.js # CRUD for questions
│   │   ├── answerController.js   # CRUD + accept for answers
│   │   ├── commentController.js  # CRUD for comments
│   │   ├── ratingController.js   # Star ratings + points management
│   │   ├── leaderboardController.js
│   │   ├── tagController.js      # Tag CRUD + user interests
│   │   ├── reportController.js   # Content reports
│   │   └── adminController.js    # Admin-only actions
│   └── routes/
│       ├── authRoutes.js
│       ├── questionRoutes.js
│       ├── answerRoutes.js
│       ├── commentRoutes.js
│       ├── ratingRoutes.js
│       ├── leaderboardRoutes.js
│       ├── tagRoutes.js
│       ├── reportRoutes.js
│       └── adminRoutes.js
├── schema.sql                    # Canonical schema for fresh DB
├── migration_v2.sql              # Upgrade path from v1 split-table schema
├── .env                          # Environment variables (not committed)
└── package.json
docs/
├── API.md                        # Full API reference
├── DATABASE.md                   # Schema reference + ERD
└── ARCHITECTURE.md               # This file
```

---

## Authentication & Authorisation

### JWT Flow

1. Client sends credentials → `POST /api/auth/login`
2. Server verifies credentials, checks `is_active`, issues a signed JWT.
3. JWT payload: `{ id, nickname, role, is_active }`
4. Client stores the token and sends it in every protected request as:
   ```
   Authorization: Bearer <token>
   ```

### Middleware Chain

```
Request → authenticate → [isAdmin] → controller
```

| Middleware | File | Purpose |
|---|---|---|
| `authenticate` | `authMiddleware.js` | Verifies JWT, attaches `req.user` |
| `isAdmin` | `adminMiddleware.js` | Checks `req.user.role === 'admin'` |

### Role-Based Access Control

| Role | Can do |
|---|---|
| `student` | Post questions/answers, comment on questions, rate (as question owner), report |
| `lecturer` | Same as student + comment on answers |
| `admin` | All of the above + user management, content moderation, tag management |

> Admin accounts are created directly in the database and **cannot** self-register via the API.

---

## Security Practices

| Concern | Implementation |
|---|---|
| Password storage | bcrypt, cost factor 10 |
| SQL injection | All queries use `$N` parameterised placeholders — **no string interpolation** |
| Token security | JWT signed with `JWT_SECRET`, expires in 24 h |
| Sensitive data exposure | `email` and `password` are **never** returned in public-facing responses |
| Deactivated users | `is_active` checked at login; JWT is not re-validated per-request against DB (stateless design) |
| Rate limiting | Not implemented — add `express-rate-limit` for production |

---

## Points System

Points are stored on `users.points` and updated atomically via SQL on rating events:

| Event | Effect on `rated_user.points` |
|---|---|
| Rating created | `+= stars` |
| Rating updated | `+= (new_stars - old_stars)` |
| Rating deleted | `-= stars` |

Leaderboards read from:
- **All-time:** `users.points` (pre-aggregated, fast)
- **Monthly:** `SUM(ratings.stars)` for the current calendar month (computed on request)

---

## Interest-Based Feed

When `GET /api/questions` is called with a valid JWT:
1. The server loads the user's `user_interests` tag IDs.
2. It computes `interest_score` per question as the count of matching tags.
3. Results are ordered `interest_score DESC, created_at DESC`.

When called without a JWT, the `interest_score` defaults to `0` and results sort by recency only.

---

## Comment Restrictions

Per the CampusQ proposal:
- **Students and lecturers** may comment on questions.
- **Only lecturers** may comment on answers (to provide authoritative clarifications).

This is enforced server-side in `commentController.createComment`:
```js
if (answer_id && role === 'student') {
    return res.status(403).json({ message: 'Only lecturers can comment on answers.' })
}
```

---

## Error Handling

All controllers are wrapped in `try/catch`. Unexpected errors return:
```json
{ "message": "Server error." }
```
with HTTP `500`. The actual error is logged to `console.error` for server-side debugging.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default 5000) | Server listen port |
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | Yes | PostgreSQL port |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | DB username |
| `DB_PASSWORD` | Yes | DB password |
| `DATABASE_URL` | Alternative | Full connection string (overrides individual vars; SSL enabled) |
| `JWT_SECRET` | Yes | Secret for signing JWTs |

---

## Adding a New Feature (Checklist)

1. **Schema** — Add or alter tables in `schema.sql` (and write a migration script).
2. **Controller** — Create or update the relevant `*Controller.js`.
3. **Route** — Register the endpoint in the corresponding `*Routes.js`.
4. **index.js** — Ensure the route file is imported and mounted.
5. **Docs** — Update `docs/API.md` with the new endpoint.
6. **Security** — Apply `authenticate` and/or `isAdmin` middleware as needed.
7. **Validation** — Check all required fields, return `400` with a descriptive message.
8. **Parameterised queries** — Never interpolate user input into SQL strings.
