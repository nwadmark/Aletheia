# Backend Development Plan — MenoNavigator

## 1️⃣ Executive Summary
- **Goal:** Build a secure, scalable backend for MenoNavigator to replace the current dummy frontend storage.
- **Stack:** FastAPI (Python 3.13), MongoDB Atlas (Motor/Pydantic v2).
- **Constraints:** No Docker, synchronous background tasks, single-branch (`main`) workflow.
- **Approach:** Iterative sprints (S0-S5) to progressively activate frontend features with real data.

## 2️⃣ In-Scope & Success Criteria
- **Scope:**
  - User Authentication (JWT)
  - Onboarding & Profile Management
  - Daily Symptom Logging & History
  - Symptom Trends (Data supply)
  - Educational Library & Bookmarking
  - Data Export (CSV)
- **Success Criteria:**
  - All "dummy" data in frontend replaced by API calls.
  - Manual verification passes for every task.
  - Code pushed to `main` only after sprint validation.

## 3️⃣ API Design
- **Base Path:** `/api/v1`
- **Error Format:** `{ "detail": "message" }`
- **Endpoints:**
  - `GET /healthz` — DB connection check
  - `POST /auth/signup` — Register
  - `POST /auth/login` — Get JWT
  - `GET /users/me` — Get profile & onboarding status
  - `PATCH /users/me` — Update profile & onboarding
  - `GET /logs` — Get logs (optional date range filters)
  - `POST /logs` — Create/Update daily log (upsert by date)
  - `DELETE /logs/{date}` — Remove log
  - `GET /articles` — List educational content
  - `POST /articles/{id}/bookmark` — Toggle bookmark

## 4️⃣ Data Model (MongoDB Atlas)
- **users**
  - `_id`: ObjectId
  - `email`: string (unique, index)
  - `password_hash`: string
  - `name`: string
  - `age_range`: string (nullable)
  - `menstrual_status`: string (nullable)
  - `primary_symptoms`: array[string]
  - `onboarding_completed`: boolean (default false)
  - `created_at`: datetime

- **symptom_logs**
  - `_id`: ObjectId
  - `user_id`: ObjectId (index)
  - `date`: string (YYYY-MM-DD) (compound index with user_id, unique)
  - `symptoms`: array of `{ name: string, severity: int }`
  - `notes`: string
  - `created_at`: datetime

- **articles**
  - `_id`: ObjectId
  - `title`: string
  - `category`: string (Symptoms, Nutrition, Essential)
  - `content`: string
  - `read_time`: string
  - `tags`: array[string]
  - `image_class`: string

- **bookmarks**
  - `_id`: ObjectId
  - `user_id`: ObjectId (index)
  - `article_id`: ObjectId
  - `created_at`: datetime

## 5️⃣ Frontend Audit & Feature Map
- **Onboarding (`/onboarding`)**
  - Needs: `PATCH /users/me` to save age, status, symptoms.
- **Dashboard (`/dashboard`)**
  - Needs: `GET /users/me` (name), `GET /logs?date=today` (status check), `GET /logs` (recent activity).
- **Log (`/log`)**
  - Needs: `GET /logs?date={selected}` (populate form), `POST /logs` (save).
- **Calendar (`/calendar`)**
  - Needs: `GET /logs?start={...}&end={...}` (month view).
- **Trends (`/trends`)**
  - Needs: `GET /logs` (calculation handled on frontend for MVP).
- **Learn (`/learn`)**
  - Needs: `GET /articles`, `POST /articles/{id}/bookmark`.
- **Settings (`/settings`)**
  - Needs: `PATCH /users/me`, `POST /users/export`.

## 6️⃣ Configuration & ENV Vars
- `APP_ENV`: "development"
- `PORT`: "8000"
- `MONGODB_URI`: "mongodb+srv://..."
- `JWT_SECRET`: "secret-key-here"
- `JWT_EXPIRE_MINUTES`: "10080" (7 days)
- `CORS_ORIGINS`: "http://localhost:3000"

## 7️⃣ Testing Strategy
- **Process:**
  - Dev completes task → Runs backend locally.
  - Dev opens Frontend → Points `.env.local` to backend.
  - Dev performs specific "Manual Test Step".
  - If success → Mark done.
  - If failure → Fix & retry.
- **Final Sprint Step:** Push to `main`.

---

# 🔟 Dynamic Sprint Plan

## 🧱 S0 – Environment Setup
- **Objectives:**
  - Initialize FastAPI project structure.
  - Connect MongoDB Atlas (Motor).
  - Setup CORS and Environment variables.
- **Tasks:**
  - **Setup Project:** Create `main.py`, `config.py`, `database.py`.
    - *Manual Test:* Run `python main.py`. Terminal shows startup logs.
    - *User Test Prompt:* "Start the server and ensure no errors in terminal."
  - **Health Endpoint:** Create `GET /healthz` returning `{"status": "ok", "db": "connected"}`.
    - *Manual Test:* Visit `http://localhost:8000/healthz`.
    - *User Test Prompt:* "Check the health endpoint in browser. Confirm DB connection status."
  - **Git Init:** Initialize repo, create `.gitignore`, push to `main`.
    - *Manual Test:* Check GitHub repo.
    - *User Test Prompt:* "Verify the repository exists and has the initial code."

## 🧩 S1 – Auth Foundation
- **Objectives:**
  - Secure User Registration & Login.
  - JWT Token generation.
- **Tasks:**
  - **User Model & DB:** Create Pydantic models and MongoDB user collection helper.
    - *Manual Test:* None (backend internal).
    - *User Test Prompt:* "Code review only for this step."
  - **Signup Endpoint:** `POST /auth/signup` (hash password with Argon2).
    - *Manual Test:* Use curl/Postman to create user. Check Compass/Atlas to see document.
    - *User Test Prompt:* "Send a POST request to signup. Check if user appears in MongoDB."
  - **Login Endpoint:** `POST /auth/login` returns `{access_token, token_type}`.
    - *Manual Test:* Login with created user. Decode returned JWT on jwt.io.
    - *User Test Prompt:* "Login via API client and verify you get a valid JWT."
  - **Get Current User:** `GET /users/me` (Protected).
    - *Manual Test:* Request with Bearer token. Receive user JSON.
    - *User Test Prompt:* "Call /users/me with the token. Confirm it returns your email/name."

## 👤 S2 – User Profile & Onboarding
- **Objectives:**
  - Allow users to complete onboarding.
  - Persist profile data.
- **Tasks:**
  - **Update Profile:** `PATCH /users/me` to accept `age_range`, `menstrual_status`, `primary_symptoms`, `onboarding_completed`.
    - *Manual Test:* Send PATCH with profile data. GET /users/me to verify update.
    - *User Test Prompt:* "Update user profile via API. Verify changes persist."
  - **Frontend Integration (Frontend work required):** Update frontend auth to call these endpoints.
    - *Manual Test:* Register on frontend. Complete onboarding flow. Refresh page. Dashboard should appear (not redirect to onboarding).
    - *User Test Prompt:* "Register a new user in the UI, go through onboarding, and refresh. You should stay on the dashboard."

## 📝 S3 – Symptom Logging & History
- **Objectives:**
  - CRUD for daily logs.
  - Power Dashboard, Calendar, and Trends.
- **Tasks:**
  - **Log Model:** Pydantic model for SymptomLog.
    - *Manual Test:* Internal.
    - *User Test Prompt:* "Code review."
  - **Upsert Log:** `POST /logs` (payload includes `date`). If exists for date, update; else create.
    - *Manual Test:* POST log for "2023-10-25". POST again with different severity. Check DB has only one entry for that date/user with new values.
    - *User Test Prompt:* "Log symptoms for a specific date twice. Ensure only the latest version is saved."
  - **Get Logs:** `GET /logs` (allow optional `start_date`, `end_date`).
    - *Manual Test:* Create 3 logs. Call endpoint. Verify list.
    - *User Test Prompt:* "Retrieve logs and count if they match the number of entries created."
  - **Frontend Integration:** Connect `log/page.tsx` and `dashboard/page.tsx` to API.
    - *Manual Test:* Log a symptom in UI. Go to Dashboard. See "You're all caught up!".
    - *User Test Prompt:* "Log a symptom in the app. Check if the Dashboard updates immediately."

## 📚 S4 – Educational Content & Bookmarks
- **Objectives:**
  - Serve articles.
  - Handle bookmarks.
- **Tasks:**
  - **Seed Articles:** Create a script/endpoint to insert the hardcoded `ARTICLES` from `store.tsx` into MongoDB.
    - *Manual Test:* Run seed. Check `articles` collection in Atlas.
    - *User Test Prompt:* "Run the seed script and verify articles exist in the database."
  - **List Articles:** `GET /articles`.
    - *Manual Test:* Call endpoint.
    - *User Test Prompt:* "Fetch articles list. Should return JSON array."
  - **Toggle Bookmark:** `POST /articles/{id}/bookmark`.
    - *Manual Test:* Call bookmark. Call again (should unbookmark or return status). Check `bookmarks` collection.
    - *User Test Prompt:* "Bookmark an article. Verify it appears in your bookmarked list."
  - **Frontend Integration:** Connect `learn/page.tsx`.
    - *Manual Test:* Click bookmark icon on article. Refresh. Icon stays filled.
    - *User Test Prompt:* "Toggle a bookmark in the UI and refresh. State should persist."

## ⚙️ S5 – Settings & Data Export
- **Objectives:**
  - Profile management.
  - CSV Export.
- **Tasks:**
  - **CSV Export:** `GET /users/export` returns CSV file download.
    - *Manual Test:* Hit endpoint in browser. File `data.csv` downloads. Open in Excel.
    - *User Test Prompt:* "Click Export in Settings. Verify a CSV file downloads with your log data."
  - **Account Deletion:** `DELETE /users/me`.
    - *Manual Test:* Delete account. Try to login (should fail). Check DB (user doc gone).
    - *User Test Prompt:* "Delete your account via Settings. Try logging in again to confirm removal."
