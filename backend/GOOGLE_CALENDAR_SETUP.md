# Google Calendar Integration Setup Guide

This guide walks you through setting up Google Calendar integration for the Altheia health tracking application.

## Prerequisites

- Google Cloud Platform account
- Backend application deployed or running locally
- Access to environment variables configuration

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (or Internal if using Google Workspace)
3. Fill in the required information:
   - **App name**: Altheia Health Tracker
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes**
6. Add the following scope:
   - `https://www.googleapis.com/auth/calendar.events`
7. Click **Update** and then **Save and Continue**
8. Add test users if using External type (add your own email for testing)
9. Click **Save and Continue** and then **Back to Dashboard**

## Step 4: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application** as the application type
4. Configure the OAuth client:
   - **Name**: Altheia Backend
   - **Authorized JavaScript origins**: 
     - `http://localhost:8000` (for local development)
     - `https://api.altheia.app` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:8000/api/google-calendar/callback` (for local development)
     - `https://api.altheia.app/api/google-calendar/callback` (for production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret** - you'll need these for environment variables

## Step 5: Generate Encryption Key

The application uses Fernet encryption to securely store OAuth refresh tokens. Generate an encryption key:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Copy the output - this is your `ENCRYPTION_KEY`.

## Step 6: Configure Environment Variables

Add the following to your backend `.env` file:

```env
# Google Calendar Integration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-calendar/callback

# Encryption Key
ENCRYPTION_KEY=your-fernet-encryption-key

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

**Important Security Notes:**
- Never commit the `.env` file to version control
- Use different credentials for development and production
- Rotate the encryption key periodically in production
- Store production secrets in a secure secrets manager

## Step 7: Install Dependencies

Install the required Python packages:

```bash
cd backend
pip install -r requirements.txt
```

## Step 8: Test the Integration

1. Start your backend server:
   ```bash
   python main.py
   ```

2. Test the OAuth flow:
   - Navigate to your frontend settings page
   - Click "Connect Google Calendar"
   - You should be redirected to Google's consent screen
   - Grant permissions
   - You should be redirected back to your app with a success message

3. Test syncing a log:
   - Create a symptom log in the app
   - The log should automatically sync to your Google Calendar
   - Check your "Altheia Health" calendar in Google Calendar

## API Endpoints

### Authentication Endpoints

- **GET** `/api/google-calendar/auth` - Initiate OAuth flow
- **GET** `/api/google-calendar/callback` - OAuth callback handler
- **POST** `/api/google-calendar/disconnect` - Disconnect Google Calendar
- **GET** `/api/google-calendar/status` - Check connection status

### Sync Endpoints

- **POST** `/api/google-calendar/sync` - Sync a single log
- **POST** `/api/google-calendar/sync-all` - Batch sync all logs
- **DELETE** `/api/google-calendar/sync/{log_id}` - Delete synced event
- **POST** `/api/google-calendar/toggle-sync` - Enable/disable auto-sync

## Troubleshooting

### "Invalid credentials" error
- Verify your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure the redirect URI in your code matches the one in Google Cloud Console

### "No refresh token received"
- Make sure `access_type='offline'` is set in the OAuth flow
- Try revoking access at https://myaccount.google.com/permissions and reconnecting
- Ensure `prompt='consent'` is included to force the consent screen

### "Failed to decrypt data" error
- Verify your `ENCRYPTION_KEY` is correct and hasn't changed
- If you changed the key, existing tokens will need to be re-authorized

### Calendar events not appearing
- Check that the "Altheia Health" calendar is visible in Google Calendar
- Verify the calendar ID is stored correctly in the user's profile
- Check backend logs for sync errors

## Production Deployment Checklist

- [ ] Use production Google Cloud credentials
- [ ] Update redirect URIs to production URLs
- [ ] Store secrets in a secure secrets manager (not in code)
- [ ] Enable HTTPS for all endpoints
- [ ] Set up monitoring and error logging
- [ ] Test OAuth flow with multiple users
- [ ] Implement rate limiting for API endpoints
- [ ] Set up backup for encryption keys
- [ ] Document key rotation procedures
- [ ] Test token refresh mechanism

## Security Best Practices

1. **Token Storage**: Refresh tokens are encrypted using Fernet before storage
2. **Minimal Scopes**: Only request `calendar.events` scope (not full calendar access)
3. **Token Rotation**: Implement periodic token refresh
4. **Audit Logging**: Log all OAuth operations for security monitoring
5. **User Control**: Users can disconnect at any time
6. **HTTPS Only**: Always use HTTPS in production
7. **CORS Configuration**: Restrict CORS to your frontend domain only

## Support

For issues or questions:
- Check the backend logs for detailed error messages
- Review Google Cloud Console audit logs
- Consult the [Google Calendar API documentation](https://developers.google.com/calendar/api)