# Google Calendar Integration Architecture Plan

## 1. Executive Summary
**Goal:** Integrate Google Calendar API into the Altheia/MenoNavigator application to allow users to synchronize their symptom logs with their personal calendars. This enables users to visualize health patterns alongside their daily life events and share symptom history with caregivers or providers via standard calendar formats.

**Strategy:**
- **Phase 1 (MVP):** One-way sync from Altheia -> Google Calendar.
- **Mechanism:** Real-time sync (trigger-based) when logs are created/updated, plus an optional "Full Sync" button.
- **Security:** OAuth 2.0 Authorization Code flow with backend token storage (encrypted).

## 2. Architecture Overview

```mermaid
graph TD
    subgraph Frontend [Next.js Frontend]
        UI[Settings UI] -->|1. Request Auth URL| API_Auth
        UI -->|4. Toggle Sync| API_Sync
        LogUI[Log Symptom Page] -->|5. Save Log| API_Log
    end

    subgraph Backend [FastAPI Backend]
        API_Auth[GET /auth/google/url] -->|Returns URL| UI
        API_Callback[GET /auth/google/callback] -->|Exchanges Code for Token| GoogleIdentity
        API_Log[POST /logs] -->|Trigger Sync| SyncService
        SyncService[Sync Service] -->|Map Data| GCalClient
        
        db[(MongoDB)]
        Backend -->|Store Refresh Token| db
    end

    subgraph Google [Google Cloud Platform]
        GoogleIdentity[Identity Platform]
        GCalAPI[Google Calendar API]
    end

    UI -->|2. Redirect to Google| GoogleIdentity
    GoogleIdentity -->|3. Callback with Code| API_Callback
    GCalClient -->|Create/Update Event| GCalAPI
```

## 3. Detailed Data Flow & Authentication

### 3.1 OAuth 2.0 Flow
We will use the **Authorization Code Flow** for server-side apps to ensure refresh tokens are securely stored on the backend and never exposed to the client.

1.  **Initiate:** User clicks "Connect Google Calendar" in Frontend Settings.
2.  **Request:** Frontend calls `GET /api/v1/auth/google/url`.
3.  **Redirect:** Backend generates a Google Authorization URL with:
    -   `client_id`: (From GCP Console)
    -   `redirect_uri`: `https://api.altheia.app/api/v1/auth/google/callback` (or localhost for dev)
    -   `response_type`: `code`
    -   `access_type`: `offline` (Critical for getting a Refresh Token)
    -   `scope`: `https://www.googleapis.com/auth/calendar.events` (Write access)
4.  **Consent:** User approves access on Google's screen.
5.  **Callback:** Google redirects to Backend `redirect_uri` with a `code`.
6.  **Exchange:** Backend exchanges `code` for `access_token` and `refresh_token`.
7.  **Storage:** Backend encrypts and stores `refresh_token` in the User document.
8.  **Completion:** Backend redirects user back to Frontend (e.g., `/settings?status=connected`).

### 3.2 Sync Strategy (One-Way: App to GCal)
To avoid managing complex conflict resolution in the MVP, we will treat the Altheia App as the "Source of Truth" for symptom events.

*   **Dedicated Calendar:** Ideally, create a secondary calendar named "Altheia Health" to avoid cluttering the user's primary calendar.
*   **Event Mapping:**
    *   **Title:** "Symptom Log: [Severity Level]" (e.g., "Symptom Log: Moderate")
    *   **Description:** List of symptoms and notes.
        ```text
        Symptoms:
        - Hot Flushes: 4/5
        - Brain Fog: 2/5
        
        Notes: "Feeling stressed today."
        ```
    *   **Time:** All-day event.
    *   **Color:** Map severity to Google Calendar colors (e.g., Red for Severe, Yellow for Moderate).
    *   **Metadata:** Store `altheia_log_id` in the Event's `extendedProperties` to allow updates/deletes.

## 4. Backend Implementation (FastAPI)

### 4.1 Database Schema Updates (MongoDB)
Update the `User` model to store auth credentials and settings.

```python
# models/user.py

class GoogleCalendarSettings(BaseModel):
    is_enabled: bool = False
    calendar_id: str | None = None  # ID of the "Altheia Health" calendar
    last_sync: datetime | None = None

class User(BaseModel):
    # ... existing fields ...
    google_auth: dict | None = None  # Encrypted refresh_token
    calendar_settings: GoogleCalendarSettings = GoogleCalendarSettings()
```

### 4.2 API Endpoints

#### Authentication
*   `GET /auth/google/url`
    *   Generates and returns the OAuth consent URL.
*   `GET /auth/google/callback`
    *   Handles the redirect from Google.
    *   Exchanges code for tokens.
    *   Creates the "Altheia Health" calendar if it doesn't exist.
    *   Updates User profile.
    *   Redirects to frontend.
*   `POST /auth/google/disconnect`
    *   Revokes token and clears DB fields.

#### Syncing
*   `POST /calendar/sync`
    *   Triggers a manual full sync (useful for initial setup).

### 4.3 Background Logic (Services)
*   **`GoogleClientService`**: Wrapper around `google-api-python-client`.
    *   `get_client(user_id)`: Refreshes access token using stored refresh token.
    *   `create_calendar_event(log_data)`: Formats and pushes event.
    *   `update_calendar_event(event_id, log_data)`: Updates existing.
    *   `delete_calendar_event(event_id)`: Removes event.

*   **Trigger Hook**:
    *   In the existing `POST /logs` endpoint, after successfully saving to MongoDB:
        ```python
        if user.calendar_settings.is_enabled:
            background_tasks.add_task(sync_log_to_calendar, user_id, log_data)
        ```

## 5. Frontend Implementation (Next.js)

### 5.1 Settings Page (`app/settings/page.tsx`)
Add a "Integrations" card.

*   **State:**
    *   `isConnected`: derived from user profile (needs API update to return this flag).
    *   `syncEnabled`: toggle switch.
*   **Actions:**
    *   **Connect:** Redirects `window.location.href` to `/api/v1/auth/google/url`.
    *   **Disconnect:** Calls `POST /auth/google/disconnect`.
    *   **Sync Now:** Calls `POST /calendar/sync`.

### 5.2 Store Updates (`lib/store.tsx`)
*   Update `User` type to include `calendarConnected: boolean`.
*   Update `updateProfile` to handle calendar settings if exposed directly.

## 6. Security Considerations

1.  **Token Storage:**
    *   **NEVER** store tokens in local storage or frontend code.
    *   Store `refresh_token` in MongoDB.
    *   **Encryption:** Use a symmetric encryption key (e.g., Fernet from `cryptography`) loaded from env `ENCRYPTION_KEY` to encrypt the token before writing to DB, and decrypt before using.
2.  **Scopes:**
    *   Request minimum scope: `https://www.googleapis.com/auth/calendar.events` (allows creating/editing events). Avoid `calendar` (full access) if possible, unless we need to delete calendars.
3.  **Environment Variables:**
    *   `GOOGLE_CLIENT_ID`
    *   `GOOGLE_CLIENT_SECRET`
    *   `GOOGLE_REDIRECT_URI`
    *   `ENCRYPTION_KEY`

## 7. Implementation Roadmap

### Phase 1: Setup & Auth (Sprint 1)
- [ ] Create GCP Project and configure OAuth Consent Screen.
- [ ] Install backend dependencies (`google-auth-oauthlib`, `cryptography`).
- [ ] Implement Backend `User` schema changes.
- [ ] Implement `/auth/google/url` and `/auth/google/callback`.
- [ ] Add encryption helper for tokens.

### Phase 2: Sync Logic (Sprint 2)
- [ ] Implement `GoogleCalendarService` to handle API calls.
- [ ] Create "Altheia Health" calendar on initial connection.
- [ ] Hook into `POST /logs` to trigger event creation.
- [ ] Hook into `PATCH /logs` to update events.
- [ ] Hook into `DELETE /logs` to remove events.

### Phase 3: Frontend & Polish (Sprint 2)
- [ ] Update `SettingsPage` with Connect/Disconnect UI.
- [ ] Add "Syncing..." status indicators.
- [ ] Test edge cases (Token expired, User revoked access externally).

## 8. Next Steps
1.  **Approval:** Review this architecture plan.
2.  **Credentials:** User needs to set up a Google Cloud Project and generate Client ID/Secret.
3.  **Development:** Switch to `Code` mode to begin Phase 1 implementation.