# Swagger/OpenAPI Documentation Setup

## Overview

Swagger UI has been successfully integrated into the Altheia Backend API. FastAPI provides automatic interactive API documentation out of the box.

## What Was Added

### 1. Enhanced FastAPI Configuration

Updated [`main.py`](main.py:13) with comprehensive API metadata:
- Detailed API description with features and authentication flow
- Contact information
- License information
- Multiple server configurations (development and production)
- Custom documentation URLs

### 2. Router Documentation Enhancements

Enhanced both router files with detailed Swagger annotations:

**[`routers/google_calendar_auth.py`](routers/google_calendar_auth.py:20)**
- Added response models and status codes
- Detailed endpoint descriptions
- Parameter documentation
- Usage examples

**[`routers/google_calendar_sync.py`](routers/google_calendar_sync.py:16)**
- Request/response models with examples
- Comprehensive endpoint documentation
- Error response definitions
- Use case descriptions

### 3. API Documentation

Created [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md:1) with:
- Complete endpoint reference
- Request/response examples
- Authentication flow
- Error handling
- Setup instructions

## Accessing Swagger UI

Once the backend server is running, you can access:

### Swagger UI (Interactive)
```
http://localhost:8000/docs
```

Features:
- Interactive API testing
- Try out endpoints directly in the browser
- View request/response schemas
- See example payloads
- Test authentication flows

### ReDoc (Alternative View)
```
http://localhost:8000/redoc
```

Features:
- Clean, readable documentation
- Better for sharing and reading
- Responsive design
- Search functionality

### OpenAPI Schema (JSON)
```
http://localhost:8000/openapi.json
```

Features:
- Raw OpenAPI 3.0 specification
- Can be imported into Postman, Insomnia, etc.
- Used by code generators

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Important:** Update these values in `.env`:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string
- `GOOGLE_CLIENT_ID`: 473182358640-eduth7hlbee676112jrpa4irp475ftvj.apps.googleusercontent.com
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `ENCRYPTION_KEY`: Generate with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`

### 3. Run the Server

```bash
# Option 1: Using the main.py script
python3 main.py

# Option 2: Using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access Documentation

Open your browser and navigate to:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## API Endpoints Overview

### Health Check
- `GET /` - Root health check
- `GET /health` - Detailed health check

### Google Calendar Authentication
- `GET /api/google-calendar/auth` - Initiate OAuth flow
- `GET /api/google-calendar/callback` - OAuth callback handler
- `POST /api/google-calendar/disconnect` - Disconnect calendar
- `GET /api/google-calendar/status` - Get connection status

### Google Calendar Sync
- `POST /api/google-calendar/sync` - Sync single log
- `POST /api/google-calendar/sync-all` - Batch sync all logs
- `DELETE /api/google-calendar/sync/{log_id}` - Delete synced event
- `POST /api/google-calendar/toggle-sync` - Enable/disable sync

## Features

### 1. Interactive Testing

Swagger UI allows you to:
- Click "Try it out" on any endpoint
- Fill in parameters
- Execute requests
- See real responses

### 2. Schema Validation

All request/response models are validated:
- Type checking
- Required fields
- Format validation
- Example values

### 3. Authentication Documentation

Clear documentation of:
- OAuth 2.0 flow
- Token management
- Security considerations

### 4. Error Responses

Documented error codes:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Integration Status

### ✅ Backend-Frontend Integration

The backend is successfully integrated with the frontend:

1. **API Endpoints Match**: All frontend API calls in [`frontend/lib/google-calendar-api.ts`](../frontend/lib/google-calendar-api.ts:6) correctly point to backend endpoints

2. **CORS Configured**: Backend allows requests from `http://localhost:3000`

3. **Request/Response Models**: Frontend TypeScript interfaces match backend Pydantic models

4. **OAuth Flow**: Complete OAuth 2.0 flow implemented:
   - Frontend initiates auth
   - Backend handles Google OAuth
   - Callback redirects to frontend with status

### Frontend Components Using Backend

- [`frontend/components/google-calendar-status.tsx`](../frontend/components/google-calendar-status.tsx:1) - Displays connection status
- [`frontend/components/google-calendar-sync-button.tsx`](../frontend/components/google-calendar-sync-button.tsx:1) - Triggers sync operations
- [`frontend/lib/google-calendar-api.ts`](../frontend/lib/google-calendar-api.ts:1) - API client wrapper

## Google Calendar Configuration

The Google Client ID has been updated in [`.env.example`](.env.example:21):
```
GOOGLE_CLIENT_ID=473182358640-eduth7hlbee676112jrpa4irp475ftvj.apps.googleusercontent.com
```

Make sure to:
1. Copy this to your `.env` file
2. Add your `GOOGLE_CLIENT_SECRET`
3. Configure the redirect URI in Google Cloud Console

## Next Steps

1. **Install Dependencies**: Run `pip install -r requirements.txt`
2. **Configure Environment**: Set up your `.env` file
3. **Start Backend**: Run `python3 main.py` or `uvicorn main:app --reload`
4. **Test API**: Visit http://localhost:8000/docs
5. **Test Integration**: Ensure frontend can communicate with backend

## Troubleshooting

### Dependencies Not Installed
```bash
cd backend
pip install -r requirements.txt
```

### Port Already in Use
```bash
# Use a different port
uvicorn main:app --reload --port 8001
```

### CORS Errors
Check that `CORS_ORIGINS` in `.env` includes your frontend URL:
```
CORS_ORIGINS=http://localhost:3000
```

### Environment Variables Not Loading
Ensure `.env` file exists in the `backend` directory and contains all required variables.

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Google Calendar API](https://developers.google.com/calendar)

## Support

For issues or questions:
- See [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) for detailed API reference
- See [`GOOGLE_CALENDAR_SETUP.md`](GOOGLE_CALENDAR_SETUP.md) for Google Calendar setup
- Check [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) for implementation details