# CampusQ — Complete IT Audit & System Verification Report

**Project Title:** CampusQ — An Anonymous Academic Question and Answer Platform  
**Target Institution:** Sabaragamuwa University of Sri Lanka  
**Audit Date:** August 9, 2026  
**Auditor:** Antigravity AI Engineering & Audit Team  
**Scope:** Whole Workspace (`/client`, `/server`, `/docs`, Database Schemas, System Architecture)

---

## 1. Executive Summary & Audit Verdict

| Audit Dimension | Status / Rating | Summary |
|---|---|---|
| **Project Completeness** | ⚠️ **85% - Incomplete** | Core features built, but 3 critical runtime bugs block key user flows and 1 frontend UI module is missing. |
| **Requirements Alignment** | 🟡 **Partial Compliance** | Aligns well with proposal modules (Q&A, Ratings, Moderation, Leaderboards), but fails on interest selection UI & schema completeness. |
| **Industry Standards** | ❌ **Non-Compliant** | Zero test coverage, SQL injection vulnerability in userController, missing rate limiting, missing CORS restrictions, double API endpoints. |
| **Production Readiness** | 🔴 **Not Ready** | Cannot be deployed as-is without fixing critical URL prefix bugs, schema mismatches, and security headers. |

### Overall Verdict:
**CampusQ is NOT yet 100% complete or production-ready.** While the foundational architecture (React + Vite, Node.js + Express, PostgreSQL) is well-structured and aesthetically pleasing, the application suffers from **3 breaking runtime bugs**, **1 SQL vulnerability**, **1 missing UI feature (User Interests Selection)**, and **complete absence of automated testing and CI/CD pipelines**.

---

## 2. Requirements Compliance Audit

This section evaluates the system against the explicit functional requirements set forth in `docs/CampusQ_Proposal.md`.

### 2.1 Core Functional Modules Matrix

| Requirement / Specification | Status | Implementation Details & Findings |
|---|---|---|
| **1. User Authentication & Roles** | ✅ Compliant | - Unified `users` table supporting `student`, `lecturer`, and `admin` roles.<br>- Password hashing using `bcrypt` (cost 10).<br>- Verification using `email` and `registration_number`.<br>- Account approval mechanism (`is_approved`) and administrative activation (`is_active`). |
| **2. Anonymous Identity Protection** | ✅ Compliant | - Users select a unique `nickname` at registration.<br>- Public endpoints only expose `nickname` and `role`. Email and registration numbers are hidden from non-admin users. |
| **3. Question Management** | ✅ Compliant | - Post questions with `title`, `body`, and tag associations (`tags`).<br>- Feed search by title/body keywords (`?search=`).<br>- Filtering by tag (`?tag_id=`).<br>- Owner edit/delete rights enforced. |
| **4. Answer & Comment System** | ⚠️ Partial Bug | - Post and edit answers.<br>- Question owner can mark one answer as **Accepted Solution**.<br>- **Lecturer-only comment restriction** on answers is enforced server-side.<br>- 🔴 **BUG:** Answer average rating displays as `NaN` due to property name mismatch (`avg_stars` vs `avg_rating`). |
| **5. Star Rating & Points System** | ✅ Compliant | - Question owner can rate answers (1–5 stars).<br>- Converts stars directly to answer author `points`.<br>- Adjusting rating updates point delta; deleting rating subtracts points.<br>- Prevents self-rating and duplicate ratings. |
| **6. Leaderboard (All-Time & Monthly)** | ⚠️ Partial Bug | - Top 10 All-Time Leaderboard (`/api/leaderboard/alltime`).<br>- Top 10 Monthly Leaderboard (`/api/leaderboard/monthly`).<br>- 🔴 **BUG:** Monthly leaderboard tab shows `0` points for all users due to property key mismatch (`monthly_points` vs `points`). |
| **7. Tagging & Interest Recommendations** | 🔴 Missing UI | - Backend supports tag CRUD and `interest_score` calculation to float user's interested topics to top of feed.<br>- 🔴 **MISSING:** Frontend has no profile modal or settings page for users to select/edit their interest tags. |
| **8. Admin & Moderation Panel** | ⚠️ Partial Bug | - User approval, activation/deactivation, content deletion, reports management.<br>- Access to real user identities (email, reg_no) for accountability.<br>- 🔴 **BUG:** Admin Tag creation/editing fails with HTTP 404 because frontend calls `/api/api/tags`. |

---

## 3. Detailed Technical Audit (Industry Standards)

### 3.1 Security Audit

1. **SQL Injection Risk in `userController.js` (Line 21):**
   String concatenation directly into SQL queries bypasses parameterization.
2. **Unrestricted CORS Configuration (`server/src/index.js`):**
   `app.use(cors())` allows requests from any origin (`*`). Should be restricted to trusted client domains in production.
3. **Missing Rate Limiting & Security Headers:**
   - No protection against brute-force login attacks (missing `express-rate-limit`).
   - Missing HTTP security headers (missing `helmet` middleware).
4. **JWT Stateless Deactivation Delay:**
   JWT tokens are valid for 24h. If an admin deactivates a user, their existing token remains cryptographically valid until expiration unless verified against DB on each request or blacklisted.

### 3.2 Code Quality & Architecture Audit

1. **Orphaned / Dead Code Files:**
   - `client/src/pages/LoginPage.jsx` and `RegisterPage.jsx` are left over and unused.
   - `server/src/routes/authRoutes_bak.js` is an unversioned backup file.
   - `server/src/controllers/userController.js` duplicates endpoints handled cleanly in `tagController.js`.
2. **Database Schema Inconsistency:**
   - `server/schema.sql` (canonical fresh setup) lacks `registration_number` and `is_approved` columns on `users` table, while `authController.js` and `adminController.js` require them.
3. **Frontend API Path Bug:**
   - `AdminPanel.jsx` lines 85 & 87 use `api.patch('/api/tags/...')` and `api.post('/api/tags')`. Because `api` instance has `baseURL = '.../api'`, this results in a doubled path `http://localhost:5000/api/api/tags`.

### 3.3 Database & Data Modeling Audit

- **Normalization:** 4.5 / 5 — Clean 3NF schema using unified `users` table with roles.
- **Referential Integrity:** 5.0 / 5 — ON DELETE CASCADE foreign keys configured properly on all relations.
- **Indexing:** 4.5 / 5 — Indexes placed on key FKs (`user_id`, `question_id`, `answer_id`, `rated_user_id`).
- **Check Constraints:** 5.0 / 5 — Enforces `comments` and `reports` to belong to exactly one parent target.

### 3.4 Automated Testing & Quality Assurance Audit

- **Testing Score:** 0 / 100 (Non-Compliant)
- **Unit Tests:** 0 tests written.
- **Integration Tests:** 0 API tests written.
- **E2E Tests:** 0 Cypress/Playwright tests.
- `package.json` test script defaults to `"Error: no test specified"`.

---

## 4. Specific Critical Bugs Found & Remediation Plan

### Bug #1: Ratings Display "NaN" on Question Details Page
- **Location:** `client/src/pages/QuestionDetailPage.jsx` (Lines 221, 254)
- **Root Cause:** Backend `getAnswersByQuestionId` returns key `avg_stars`, but frontend attempts to read `answer.avg_rating`.
- **Fix:** Update frontend references to `answer.avg_stars`.

### Bug #2: Monthly Leaderboard Shows 0 Points for All Users
- **Location:** `client/src/pages/LeaderboardPage.jsx` (Line 148)
- **Root Cause:** All-time API returns `points`, whereas monthly API returns `monthly_points`. Frontend only checked `user.points`.
- **Fix:** Update frontend display to `user.points ?? user.monthly_points ?? 0`.

### Bug #3: Tag Creation & Editing in Admin Panel Throws 404
- **Location:** `client/src/pages/AdminPanel.jsx` (Lines 85, 87)
- **Root Cause:** Redundant `/api` prefix in path strings (`/api/tags`).
- **Fix:** Change to `/tags` and `/tags/${editingTag.id}`.

### Missing Feature: User Interest Selection UI
- **Location:** `client/src/pages/` (Missing Profile/Preferences Modal or Page)
- **Root Cause:** `PUT /api/user/interests` endpoint exists in backend, but frontend has no component for users to manage their interests.
- **Fix:** Build an Interest Selection Modal / Component accessible from Navbar or Feed.

---

## 5. Mandatory Action Items for Production Readiness

1. **Fix 3 Critical Frontend Runtime Bugs** (`QuestionDetailPage.jsx`, `LeaderboardPage.jsx`, `AdminPanel.jsx`).
2. **Add User Interest Selection UI** (Allow users to select favorite academic tags to personalize their feed).
3. **Synchronize `schema.sql`** (Add `registration_number` and `is_approved` to canonical DB schema).
4. **Remove SQL Injection Vulnerability** (Refactor or delete `userController.js` in favor of `tagController.js`).
5. **Clean Up Dead Code** (Delete `LoginPage.jsx`, `RegisterPage.jsx`, `authRoutes_bak.js`).
6. **Implement Test Suite** (Add Jest/Supertest backend tests & Vitest/React Testing Library frontend tests).
7. **Production Hardening** (Add `helmet`, `express-rate-limit`, CORS origin restrictions, and Dockerfile).

---

*Saved into workspace docs directory: August 9, 2026.*
