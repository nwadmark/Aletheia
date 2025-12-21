# Phase 1 Implementation Plan: Core Backend & Symptom Tracking

## Objective
Establish the backend foundation (Database, Auth) and implement the primary MVP feature (Symptom Logging). This phase builds upon the existing FastAPI scaffolding.

## 1. Database Configuration
**File:** `backend/database.py`
- **Library:** `motor` (AsyncIO MongoDB driver).
- **Functionality:**
    - Initialize `AsyncIOMotorClient` using `MONGODB_URI`.
    - Create a `get_database` dependency function.
    - **Startup Event:** Define a function to create indexes on application startup:
        - `users`: Unique index on `email`.
        - `symptom_logs`: Unique compound index on `user_id` + `date`.

## 2. Security & Authentication Utilities
**File:** `backend/utils/security.py`
- **Library:** `passlib[argon2]`, `python-jose`.
- **Functionality:**
    - `verify_password(plain, hashed)`: Verify passwords.
    - `get_password_hash(password)`: Hash new passwords.
    - `create_access_token(data)`: Generate JWTs with expiration.
    - `get_current_user`: FastAPI Dependency that:
        1. extracts the Bearer token.
        2. decodes the JWT.
        3. fetches the user from the DB.
        4. raises 401 if invalid.

## 3. Authentication Module
**File:** `backend/routers/auth.py`
- **Dependencies:** `models.user`, `utils.security`, `database`.
- **Endpoints:**
    - `POST /auth/signup`:
        - Accepts `UserCreate`.
        - Checks if email exists (400 if true).
        - Hashes password.
        - Inserts into `users` collection.
        - Returns `UserResponse` + JWT (auto-login).
    - `POST /auth/login`:
        - Accepts OAuth2PasswordRequestForm (or JSON body with email/password).
        - Verifies credentials.
        - Returns `{access_token, token_type}`.
    - `GET /users/me`:
        - Uses `get_current_user` dependency.
        - Returns `UserResponse`.

## 4. Symptom Log Feature
**File:** `backend/models/symptom_log.py`
- **Models:**
    - `SymptomItem`: `name` (str), `severity` (int 1-5), `notes` (optional str).
    - `SymptomLogBase`: `date` (str YYYY-MM-DD), `symptoms` (List[SymptomItem]), `overall_notes` (optional str).
    - `SymptomLogInDB`: Extends Base with `_id`, `user_id`, `created_at`, `updated_at`.

**File:** `backend/routers/symptom_log.py`
- **Endpoints:**
    - `POST /logs`:
        - Body: `SymptomLogBase`.
        - Logic: Check if log exists for `user.id` + `date`.
            - If yes: Update (`$set`).
            - If no: Insert new document.
    - `GET /logs`:
        - Query Params: `start_date` (opt), `end_date` (opt).
        - Logic: Find logs for `user.id` within range (or limit 30 if no range).
    - `DELETE /logs/{date}`:
        - Logic: Delete log for `user.id` + `date`.

## 5. Main Application Integration
**File:** `backend/main.py`
- **Updates:**
    - Import and include `auth.router` and `symptom_log.router`.
    - Add `@app.on_event("startup")` to connect to DB and create indexes.
    - Add `@app.on_event("shutdown")` to close DB connection.

## 6. Refactoring
**File:** `backend/routers/google_calendar_auth.py`
- Replace the placeholder `get_current_user` dependency with the real one from `utils.security`.
- Remove the placeholder `get_database` dependency and use the one from `database.py`.

## Execution Order
1.  `backend/database.py`
2.  `backend/utils/security.py`
3.  `backend/routers/auth.py`
4.  `backend/main.py` (Update 1: Auth & DB)
5.  `backend/models/symptom_log.py`
6.  `backend/routers/symptom_log.py`
7.  `backend/main.py` (Update 2: Logs)
8.  Refactor Google Calendar Auth.