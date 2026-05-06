# CampusQ Backend – Audit & Fix Report

**Date:** 2026-05-07  
**Auditor:** Antigravity  

---

## Summary

A full audit of the CampusQ Node.js/Express/PostgreSQL backend was performed against the functional requirements. **All 11 requirement sections** were reviewed and corrected. The codebase was completely rewritten where needed to align with the canonical schema, security rules, and endpoint specifications.

---

## Critical Issues Found & Fixed

### 1. DATABASE SCHEMA

| Issue | Fix |
|---|---|
| Schema used split `students` + `lecturers` tables instead of unified `users` | Created `schema.sql` with all 9 required tables using unified `users(role)` design |
| `questions` used `description`/`author_id`/`author_role` instead of `body`/`user_id` FK | Rebuilt with correct column names and FK to `users.id` |
| `answers` used `content` instead of `body`; no proper FK to `users` | Rebuilt with `user_id` FK, `is_hidden`, `updated_at` |
| `comments` used `parent_type/parent_id` polymorphic; no CHECK constraint | Rebuilt with explicit `question_id`/`answer_id` FKs + CHECK |
| `tags` used `tag_id`/`tag_name` instead of `id`/`name` | Renamed in migration |
| `user_interests` did not exist (was `user_tag_preferences` with `user_role` denorm) | Created `user_interests(user_id, tag_id)` junction |
| `ratings` table did not exist (was `answer_ratings` missing `question_id`/`rated_user_id`) | Created proper `ratings` table with UNIQUE constraint |
| `reports` used `target_type/target_id`; no `is_resolved` | Rebuilt with FK columns and `is_resolved` |
| Missing indexes on FKs and `ratings.created_at` | All required indexes added in `schema.sql` |

### 2. AUTHENTICATION

| Issue | Fix |
|---|---|
| Separate `/register/student` + `/register/lecturer` endpoints | Unified to `POST /api/auth/register` with `role` param |
| Login queried `students`/`lecturers` tables by role | Now queries `users` by email |
| JWT contained `is_admin` boolean not `role` string | Fixed; JWT now `{ id, nickname, role, is_active }` |

### 3. AUTH MIDDLEWARE

| Issue | Fix |
|---|---|
| Exported as `authenticateToken`; routes used `authenticate` | Standardised export to `authenticate` |
| `req.user` assigned raw JWT payload | Explicitly whitelisted fields only |

### 4. ADMIN MIDDLEWARE

| Issue | Fix |
|---|---|
| Checked `req.user.is_admin === true` — incompatible with role-string | Fixed to `req.user.role === 'admin'` |

### 5. QUESTIONS

| Issue | Fix |
|---|---|
| Old column names throughout | Updated to `body`, `user_id`, JOIN `users` |
| No interest-based ordering | Added `interest_score` from `user_interests` |
| Hidden questions visible to everyone | Role-aware visibility in `getQuestionById` |
| `PUT /api/questions/:id` missing | Implemented (owner only) |
| `DELETE /api/questions/:id` missing | Implemented (owner or admin) |
| Tags by name risked duplicates | Tags validated by ID array |

### 6. ANSWERS

| Issue | Fix |
|---|---|
| Old column names | Updated to `body`, `user_id` |
| No hidden-question check in `createAnswer` | Added |
| Rating join used wrong table | Fixed to `ratings` |
| `updateAnswer` allowed admin edit (spec: owner only) | Fixed |
| `rateAnswer` in wrong controller/table | Moved to `ratingController.js` |

### 7. COMMENTS

| Issue | Fix |
|---|---|
| `parent_type/parent_id` pattern | Rebuilt for `question_id`/`answer_id` schema |
| No role restriction on answer comments | Lecturer-only restriction added |
| Single `getCommentsByParent` endpoint | Split into separate question/answer endpoints |

### 8. RATINGS (new controller)

| Issue | Fix |
|---|---|
| Logic in `answerController`, wrong table | Extracted to `ratingController.js` using `ratings` |
| No `PUT /api/ratings/:id` | Implemented with point-difference adjustment |
| No `DELETE /api/ratings/:id` | Implemented with point subtraction |
| No `GET /api/ratings/answer/:answerId` | Implemented |
| Dynamic table names in SQL (injection risk) | Fixed to parameterised queries |

### 9. LEADERBOARD

| Issue | Fix |
|---|---|
| Queried two separate tables via UNION | Queries unified `users.points` |
| Monthly board joined wrong table | Fixed to `ratings.stars` via `rated_user_id` |
| No `rank` field | Added `ROW_NUMBER()` |
| Route path `/all-time` | Changed to `/alltime` |

### 10. TAGS & INTERESTS

| Issue | Fix |
|---|---|
| No dedicated tag controller | Created `tagController.js` |
| `POST /api/tags` (admin) missing | Implemented |
| `DELETE /api/tags/:id` (admin) missing | Implemented |
| Old `user_tag_preferences` with `user_role` column | Updated to `user_interests(user_id, tag_id)` |
| Template-string SQL interpolation in bulk insert | Fixed to fully parameterised |

### 11. REPORTS

| Issue | Fix |
|---|---|
| Old `target_type/target_id` pattern | Rebuilt for FK columns + `is_resolved` |
| `GET /api/reports` in adminController | Moved to `reportController.js` |
| `PATCH /api/reports/:id/resolve` missing | Implemented |
| Returned all reports including resolved | Added `WHERE is_resolved = FALSE` |

### 12. ADMIN

| Issue | Fix |
|---|---|
| `getAllUsers` queried two tables | Now queries unified `users` |
| Single `toggleUserStatus` endpoint | Split to `deactivateUser`/`reactivateUser` |
| Single `handleContent` endpoint | Split to 5 specific handlers |
| Route paths didn't match spec | Updated to RESTful spec paths |

---

## Files Created

| File | Purpose |
|---|---|
| `server/schema.sql` | Canonical 9-table schema for fresh DB |
| `server/migration_v2.sql` | Data-preserving upgrade from old schema |
| `server/src/controllers/ratingController.js` | Ratings controller |
| `server/src/controllers/tagController.js` | Tags + user interests controller |
| `server/src/routes/ratingRoutes.js` | `/api/ratings` routes |
| `server/src/routes/tagRoutes.js` | `/api/tags` routes |
| `docs/API.md` | Full API reference |
| `docs/DATABASE.md` | Schema reference |
| `docs/ARCHITECTURE.md` | Developer guide |
| `docs/AUDIT_REPORT.md` | This report |

## Files Fully Rewritten

- All controllers: `authController`, `questionController`, `answerController`, `commentController`, `leaderboardController`, `reportController`, `adminController`
- All route files: `authRoutes`, `questionRoutes`, `answerRoutes`, `commentRoutes`, `leaderboardRoutes`, `reportRoutes`, `adminRoutes`
- Both middleware: `authMiddleware`, `adminMiddleware`
- Entry point: `index.js`

## Now Unused (safe to delete)

- `server/src/controllers/userController.js`
- `server/src/routes/userRoutes.js`
- `server/database_schema.sql`
- `server/migration_admin_reports.sql`
- `server/migration_ratings.sql`
- `server/migration_tag_prefs.sql`
