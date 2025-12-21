# Altheia Backend - Google Calendar Integration

This directory contains the backend implementation for Google Calendar integration in the Altheia health tracking application.

## Overview

The Google Calendar integration allows users to sync their symptom logs to a dedicated "Altheia Health" calendar in their Google Calendar account. This enables users to:

- Visualize health patterns alongside daily life events
- Share symptom history with caregivers or healthcare providers
- Access their health data across multiple platforms
- Maintain a backup of their symptom logs

## Architecture

### Components

1. **Models** (`models/user.py`)
   - Extended User model with Google Calendar fields
   - `GoogleAuthData` - Encrypted OAuth credentials
   - `GoogleCalendarSettings` - Sync preferences and calendar ID

2. **Services** (`services/google_calendar_service.py`)
   - `GoogleCalendarService` - Core calendar API integration
   - Methods for creating calendars, syncing events, and batch operations

3. **Routers**
   - `routers/google_calendar_auth.py` - OAuth authentication endpoints
   - `routers/google_calendar_sync.py` - Calendar sync endpoints

4. **Utilities**
   - `utils/encryption.py` - Fernet encryption for secure token storage
   - `utils/exceptions.py` - Custom exception classes

5. **Configuration** (`config.py`)
   - Environment-based settings management
   - Google OAuth credentials configuration

## API Endpoints

### Authentication

#### `GET /api/google-calendar/auth`
Initiate Google OAuth flow. Returns authorization URL for user to visit.

**Response:**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/auth?...",
  "state": "random-state-string"
}
```

#### `GET /api/google-calendar/callback`
OAuth callback handler. Exchanges authorization code for tokens.

**Query Parameters:**
- `code` - Authorization code from Google
- `state` - State parameter for CSRF protection

**Redirects to:** `{FRONTEND_URL}/settings?calendar_status=connected`

#### `POST /api/google-calendar/disconnect`
Disconnect Google Calendar integration and revoke access.

**Response:**
```json
{
  "message": "Google Calendar disconnected successfully",
  "status": "disconnected"
}
```

#### `GET /api/google-calendar/status`
Check calendar connection status.

**Response:**
```json
{
  "connected": true,
  "sync_enabled": true,
  "calendar_id": "altheia_health_123@group.calendar.google.com",
  "last_sync": "2024-01-15T10:30:00Z"
}
```

### Synchronization

#### `POST /api/google-calendar/sync`
Sync a single symptom log to Google Calendar.

**Request Body:**
```json
{
  "log_id": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Symptom log synced successfully",
  "event_id": "abc123xyz"
}
```

#### `POST /api/google-calendar/sync-all`
Batch sync all user's symptom logs.

**Response:**
```json
{
  "success": true,
  "message": "Synced 15 of 15 logs",
  "synced_count": 15,
  "failed_count": 0
}
```

#### `DELETE /api/google-calendar/sync/{log_id}`
Delete a synced calendar event.

**Response:**
```json
{
  "success": true,
  "message": "Calendar event deleted successfully",
  "event_id": "abc123xyz"
}
```

#### `POST /api/google-calendar/toggle-sync`
Enable or disable automatic calendar sync.

**Query Parameters:**
- `enabled` - Boolean to enable/disable sync

**Response:**
```json
{
  "success": true,
  "message": "Calendar sync enabled",
  "sync_enabled": true
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GOOGLE_REDIRECT_URI` - Your callback URL
- `ENCRYPTION_KEY` - Generate using Fernet
- `FRONTEND_URL` - Your frontend URL

See [`GOOGLE_CALENDAR_SETUP.md`](GOOGLE_CALENDAR_SETUP.md) for detailed setup instructions.

### 3. Generate Encryption Key

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 4. Set Up Google Cloud Project

Follow the detailed guide in [`GOOGLE_CALENDAR_SETUP.md`](GOOGLE_CALENDAR_SETUP.md) to:
1. Create a Google Cloud project
2. Enable Google Calendar API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials

## Security Features

### Token Encryption
- Refresh tokens are encrypted using Fernet symmetric encryption
- Encryption key stored securely in environment variables
- Tokens never exposed to frontend or logs

### Minimal Scopes
- Only requests `calendar.events` scope
- No access to other calendar data or Google services

### OAuth Best Practices
- Uses Authorization Code flow (server-side)
- Implements state parameter for CSRF protection
- Requests offline access for refresh tokens
- Forces consent screen to ensure refresh token

### Data Protection
- Sensitive data excluded from API responses
- Proper error handling without exposing internals
- Audit logging for all OAuth operations

## Event Format

Calendar events are created with the following format:

**Title:** `Symptom Log: {Severity}`
- Example: "Symptom Log: Moderate"

**Description:**
```
Symptoms:
- Hot Flushes: 4/5
- Brain Fog: 2/5

Notes: Feeling stressed today.
```

**Properties:**
- All-day event
- Color-coded by severity (Green/Yellow/Red)
- Stored in dedicated "Altheia Health" calendar
- Contains `altheia_log_id` in extended properties for tracking

## Error Handling

The integration includes comprehensive error handling:

- `GoogleCalendarError` - Base exception class
- `GoogleAuthError` - OAuth authentication failures
- `GoogleCalendarSyncError` - Sync operation failures
- `TokenDecryptionError` - Token decryption issues
- `CalendarNotConnectedError` - Sync without connection
- `InvalidCredentialsError` - Invalid/expired credentials

All errors are logged with appropriate context and return user-friendly messages.

## Database Schema

### User Model Extensions

```python
{
  "google_auth": {
    "encrypted_refresh_token": "gAAAAABf...",
    "token_created_at": "2024-01-15T10:30:00Z"
  },
  "calendar_settings": {
    "is_enabled": true,
    "calendar_id": "altheia_health_123@group.calendar.google.com",
    "last_sync": "2024-01-15T10:30:00Z"
  }
}
```

## Integration with Existing Backend

To integrate with your existing FastAPI application:

1. **Import routers in main.py:**
```python
from backend.routers import google_calendar_auth, google_calendar_sync

app.include_router(google_calendar_auth.router)
app.include_router(google_calendar_sync.router)
```

2. **Update User model:**
   - Add `google_auth` and `calendar_settings` fields
   - Use the models from `models/user.py`

3. **Implement authentication dependency:**
   - Replace placeholder `get_current_user()` with your auth logic
   - Ensure it returns a `UserInDB` instance

4. **Implement database dependency:**
   - Replace placeholder `get_database()` with your DB connection
   - Update database operations in routers

5. **Add background task for auto-sync:**
```python
# In your symptom log creation endpoint
if user.calendar_settings.is_enabled:
    background_tasks.add_task(sync_log_to_calendar, user_id, log_data)
```

## Testing

### Manual Testing

1. Start the backend server
2. Navigate to frontend settings
3. Click "Connect Google Calendar"
4. Complete OAuth flow
5. Create a symptom log
6. Verify event appears in Google Calendar

### API Testing

Use curl or Postman to test endpoints:

```bash
# Get auth URL
curl http://localhost:8000/api/google-calendar/auth \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check status
curl http://localhost:8000/api/google-calendar/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Sync a log
curl -X POST http://localhost:8000/api/google-calendar/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"log_id": "507f1f77bcf86cd799439011"}'
```

## Troubleshooting

See [`GOOGLE_CALENDAR_SETUP.md`](GOOGLE_CALENDAR_SETUP.md) for detailed troubleshooting guide.

Common issues:
- Invalid credentials → Check Google Cloud Console settings
- No refresh token → Revoke access and reconnect
- Decryption errors → Verify encryption key hasn't changed
- Events not appearing → Check calendar visibility settings

## Production Considerations

- Use HTTPS for all endpoints
- Store secrets in secure secrets manager
- Implement rate limiting
- Set up monitoring and alerting
- Test token refresh mechanism
- Document key rotation procedures
- Enable audit logging
- Implement backup strategy

## Support

For issues or questions:
- Check backend logs for detailed error messages
- Review Google Cloud Console audit logs
- Consult [Google Calendar API documentation](https://developers.google.com/calendar/api)

## License

Part of the Altheia health tracking application.