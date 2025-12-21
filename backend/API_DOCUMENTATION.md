# Altheia Backend API Documentation

## Overview

The Altheia Backend API provides endpoints for health tracking with Google Calendar integration. The API is built with FastAPI and includes automatic interactive documentation.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.altheia.com`

## Interactive Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

## Authentication

All endpoints (except health checks) require user authentication. The authentication system should be implemented based on your specific requirements.

## API Endpoints

### Health Check

#### GET `/`
Root endpoint - health check.

**Response:**
```json
{
  "status": "healthy",
  "message": "Altheia Backend API is running",
  "version": "1.0.0"
}
```

#### GET `/health`
Detailed health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "environment": "development"
}
```

---

## Google Calendar Authentication

### GET `/api/google-calendar/auth`
Initiate Google OAuth flow.

**Description:** Start the OAuth 2.0 authorization flow for Google Calendar integration.

**Response:**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/auth?...",
  "state": "random_state_string"
}
```

**Flow:**
1. Call this endpoint to get authorization URL
2. Redirect user to the authorization URL
3. User grants permissions on Google's consent screen
4. Google redirects back to the callback endpoint

---

### GET `/api/google-calendar/callback`
Handle OAuth callback from Google.

**Query Parameters:**
- `code` (required): Authorization code from Google
- `state` (optional): State parameter for CSRF protection
- `error` (optional): Error message if authorization failed

**Response:** Redirects to frontend settings page with status

**Success Redirect:** `{FRONTEND_URL}/settings?calendar_status=connected`

**Error Redirect:** `{FRONTEND_URL}/settings?calendar_status=error&message={error}`

---

### POST `/api/google-calendar/disconnect`
Disconnect Google Calendar integration.

**Description:** Revoke Google Calendar access and clear stored credentials.

**Response:**
```json
{
  "message": "Google Calendar disconnected successfully",
  "status": "disconnected"
}
```

---

### GET `/api/google-calendar/status`
Get calendar connection status.

**Description:** Check if user has connected their Google Calendar and get sync settings.

**Response:**
```json
{
  "connected": true,
  "sync_enabled": true,
  "calendar_id": "altheia_health_calendar_id",
  "last_sync": "2024-01-15T10:30:00Z"
}
```

---

## Google Calendar Sync

### POST `/api/google-calendar/sync`
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

**Description:** Creates or updates a calendar event for the specified symptom log.

---

### POST `/api/google-calendar/sync-all`
Batch sync all symptom logs.

**Description:** Sync all user's symptom logs to Google Calendar. Useful for initial setup or full re-sync.

**Response:**
```json
{
  "success": true,
  "message": "Synced 15 of 15 logs",
  "synced_count": 15,
  "failed_count": 0
}
```

**Note:** This operation may take time for users with many logs.

---

### DELETE `/api/google-calendar/sync/{log_id}`
Delete a synced calendar event.

**Path Parameters:**
- `log_id` (required): ID of the symptom log

**Response:**
```json
{
  "success": true,
  "message": "Calendar event deleted successfully",
  "event_id": "abc123xyz"
}
```

**Important:** This only removes the calendar event, not the symptom log itself.

---

### POST `/api/google-calendar/toggle-sync`
Enable or disable automatic calendar sync.

**Query Parameters:**
- `enabled` (required): Boolean - true to enable, false to disable

**Response:**
```json
{
  "success": true,
  "message": "Calendar sync enabled",
  "sync_enabled": true
}
```

**Description:** Controls whether new symptom logs are automatically synced to Google Calendar.

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Google Calendar not connected. Please connect your calendar first."
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "detail": "Symptom log not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error message"
}
```

---

## Data Models

### SyncLogRequest
```json
{
  "log_id": "string"
}
```

### SyncResponse
```json
{
  "success": boolean,
  "message": "string",
  "event_id": "string (optional)",
  "synced_count": number (optional)
}
```

### BatchSyncResponse
```json
{
  "success": boolean,
  "message": "string",
  "synced_count": number,
  "failed_count": number
}
```

---

## Setup and Configuration

### Environment Variables

Required environment variables (see `.env.example`):

```bash
# Application
APP_ENV=development
PORT=8000

# Database
MONGODB_URI=mongodb+srv://...

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE_MINUTES=10080

# CORS
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Google Calendar
GOOGLE_CLIENT_ID=473182358640-eduth7hlbee676112jrpa4irp475ftvj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-calendar/callback

# Encryption
ENCRYPTION_KEY=your-fernet-encryption-key
```

### Running the Server

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Accessing Documentation

Once the server is running:

1. **Swagger UI**: Navigate to [http://localhost:8000/docs](http://localhost:8000/docs)
   - Interactive API documentation
   - Try out endpoints directly
   - View request/response schemas

2. **ReDoc**: Navigate to [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - Alternative documentation view
   - Better for reading and sharing

3. **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
   - Raw OpenAPI 3.0 specification
   - Can be imported into API clients

---

## Security Considerations

1. **OAuth Tokens**: Refresh tokens are encrypted using Fernet encryption before storage
2. **CORS**: Configured to only allow requests from specified frontend origins
3. **State Parameter**: Used in OAuth flow for CSRF protection
4. **HTTPS**: Should be used in production for all API calls

---

## Rate Limiting

Google Calendar API has the following limits:
- 1,000,000 queries per day
- 10 queries per second per user

The backend handles rate limiting gracefully and will retry failed requests.

---

## Support

For issues or questions:
- Email: support@altheia.com
- Documentation: See `GOOGLE_CALENDAR_SETUP.md` for setup instructions