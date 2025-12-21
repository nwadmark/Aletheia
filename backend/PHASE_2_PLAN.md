# Phase 2 Implementation Plan: Data Aggregation & External Integrations

## 1️⃣ Executive Summary
**Goal:** Move beyond isolated symptom tracking by integrating with Google Calendar. This phase focuses on correlating "life context" (meetings, travel, events) with "health context" (symptoms) to help users identify triggers.
**Key Features:**
1.  **Automated Sync (Write):** Push symptom logs to a dedicated "Altheia Health" calendar.
2.  **Context Fetching (Read):** Pull events from the user's primary calendar to display alongside symptom logs.
3.  **Data Aggregation:** APIs that combine symptom severity with calendar intensity to surface insights.

---

## 2️⃣ Architecture & Flow

### A. Symptom -> Calendar (Write Flow)
*   **Trigger:** User adds/updates a log via `POST /api/logs`.
*   **Action:** Backend uses `BackgroundTasks` to call `GoogleCalendarService.sync_symptom_log`.
*   **Result:** A color-coded "All Day" event appears in the user's Google Calendar (e.g., Red for Severe, Green for Mild).

### B. Calendar -> App (Read Flow)
*   **Trigger:** User views "Trends" or "Daily Log" in the frontend.
*   **Action:** Backend fetches events from the user's *primary* calendar for the relevant date(s).
*   **Result:** The frontend displays "You had 5 meetings this day" alongside a "Severe Headache" log.

---

## 3️⃣ Implementation Steps (Sprint 6 & 7)

### 🟢 Step 1: Finalize Sync Logic (Fix Mocks)
Currently, `routers/google_calendar_sync.py` uses mock data. We need to connect it to the real MongoDB.
*   **File:** `backend/routers/google_calendar_sync.py`
    *   **Action:** Inject `database` dependency. Replace mock dictionaries with `await db.symptom_logs.find_one(...)`.
    *   **Action:** Implement `sync_all_logs` to iterate over actual DB records.
*   **File:** `backend/routers/symptom_log.py`
    *   **Action:** Inject `BackgroundTasks`.
    *   **Action:** Call `sync_symptom_log` (internal service function, not the API endpoint) after a successful upsert.

### 🔵 Step 2: Calendar Read Capabilities
We need to read the user's non-health events to provide context.
*   **File:** `backend/services/google_calendar_service.py`
    *   **Task:** Add method `get_events_for_date_range(credentials, start_date, end_date)`.
    *   **Details:**
        *   Use `events().list` on 'primary' calendar.
        *   Filter by `timeMin` and `timeMax`.
        *   Return simplified list: `[{ summary, start, end, duration }]`.

### 🟣 Step 3: Contextual API Endpoints
Create endpoints that serve the aggregated data.
*   **File:** `backend/routers/trends.py` (New File)
    *   **Endpoint:** `GET /api/trends/context`
    *   **Params:** `date` (YYYY-MM-DD) or `start/end`.
    *   **Logic:**
        1.  Fetch SymptomLog for date from DB.
        2.  Fetch Google Calendar events for date (if connected).
        3.  Return combined object.
    *   **Response Model:**
        ```json
        {
          "date": "2024-01-20",
          "symptom_severity": "severe",
          "symptoms": ["migraine", "fatigue"],
          "calendar_context": {
            "event_count": 4,
            "busy_hours": 6.5,
            "events": ["Board Meeting", "Flight to NY"]
          }
        }
        ```

---

## 4️⃣ Task Checklist

### Backend
- [ ] **Refactor `google_calendar_sync.py`**: Remove mocks, use real DB.
- [ ] **Update `symptom_log.py`**: Trigger sync on save.
- [ ] **Update `GoogleCalendarService`**: Add `get_primary_events` method for reading context.
- [ ] **Create `routers/trends.py`**: Implement data aggregation logic.
- [ ] **Error Handling**: Handle token expiration/refresh failures gracefully during background tasks.

### Frontend Integration (for Context)
- [ ] **Dashboard Update**: Show "Context" card next to today's log.
- [ ] **Trends Update**: Overlay "Busy Days" on Symptom Charts.

---

## 5️⃣ API Changes Summary

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/logs` | **Modified:** Triggers background sync to GCal. |
| `GET` | `/api/trends/context` | **New:** Returns symptoms + calendar events for correlation. |
| `POST` | `/api/google-calendar/sync-all` | **Modified:** Iterates real DB logs to backfill calendar. |
