# 🧪 Google Calendar Integration - Testing Guide

## 📋 Table of Contents
- [Pre-Testing Setup](#pre-testing-setup)
- [Testing Scenarios](#testing-scenarios)
- [Expected Results](#expected-results)
- [Common Issues](#common-issues)
- [Test Data](#test-data)
- [Automated Testing](#automated-testing)

---

## ✅ Pre-Testing Setup Checklist

### Environment Setup
- [ ] Backend server running on `http://localhost:8000`
- [ ] Frontend server running on `http://localhost:3000`
- [ ] MongoDB database accessible and running
- [ ] `.env` file configured with all required variables
- [ ] Google Cloud Project created and configured
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Google Calendar API enabled

### Verification Steps
```bash
# 1. Check backend is running
curl http://localhost:8000/health

# 2. Check frontend is accessible
curl http://localhost:3000

# 3. Verify environment variables
cd backend
python -c "from config import settings; print('✅ Config loaded')"

# 4. Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

### Test User Setup
- [ ] Test user account created in application
- [ ] Test user logged in
- [ ] Test user has at least 3-5 symptom logs
- [ ] Google account ready for testing (can be same as test user email)

---

## 🧪 Testing Scenarios

### 1. OAuth Connection Flow

#### Test 1.1: Initial Connection
**Objective**: Verify user can successfully connect Google Calendar

**Steps**:
1. Navigate to Settings page (`/settings`)
2. Locate "Google Calendar Integration" section
3. Verify status shows "Not connected"
4. Click "Connect Google Calendar" button
5. Verify redirect to Google consent screen
6. Review requested permissions
7. Click "Continue" or "Allow"
8. Verify redirect back to Settings page

**Expected Results**:
- ✅ Button click triggers redirect
- ✅ Google consent screen displays correctly
- ✅ Permissions shown: "See, edit, share, and permanently delete all calendars"
- ✅ After approval, redirected to Settings with success message
- ✅ Status updates to "Connected" with email address
- ✅ "Altheia Health" calendar created in Google Calendar
- ✅ Auto-sync toggle becomes available
- ✅ "Sync All Logs" button becomes available

**Test Data**:
```
User ID: test-user-123
Google Account: test@example.com
```

**Verification**:
```bash
# Check user document in MongoDB
mongosh
use altheia
db.users.findOne({_id: "test-user-123"}, {google_auth: 1, calendar_settings: 1})

# Should show:
# - google_auth.encrypted_refresh_token (encrypted string)
# - calendar_settings.is_enabled: true
# - calendar_settings.calendar_id: "xxx@group.calendar.google.com"
```

#### Test 1.2: Connection Status Check
**Objective**: Verify status endpoint returns correct information

**Steps**:
1. After connecting, refresh Settings page
2. Verify connection status persists
3. Open browser DevTools → Network tab
4. Observe API call to `/api/google-calendar/status`

**Expected Results**:
- ✅ Status API called on page load
- ✅ Response shows `connected: true`
- ✅ Email address displayed correctly
- ✅ Calendar ID present
- ✅ Auto-sync status shown

**API Test**:
```bash
# Test status endpoint
curl "http://localhost:8000/api/google-calendar/status?user_id=test-user-123"

# Expected response:
{
  "connected": true,
  "email": "test@example.com",
  "calendar_id": "xxx@group.calendar.google.com",
  "auto_sync": false,
  "last_sync": null
}
```

#### Test 1.3: Reconnection After Revocation
**Objective**: Verify user can reconnect after revoking access externally

**Steps**:
1. While connected, open https://myaccount.google.com/permissions
2. Find "Altheia Health Tracker"
3. Click "Remove Access"
4. Return to Settings page
5. Try to sync a log (should fail)
6. Click "Connect Google Calendar" again
7. Complete OAuth flow

**Expected Results**:
- ✅ External revocation detected
- ✅ Sync operations fail gracefully with clear error
- ✅ Reconnection flow works normally
- ✅ New refresh token stored
- ✅ Sync functionality restored

---

### 2. Disconnection Flow

#### Test 2.1: Manual Disconnection
**Objective**: Verify user can disconnect Google Calendar

**Steps**:
1. Navigate to Settings page (while connected)
2. Click "Disconnect" button
3. Confirm disconnection in dialog (if present)
4. Verify status updates

**Expected Results**:
- ✅ Confirmation dialog appears (optional)
- ✅ Status changes to "Not connected"
- ✅ Email address removed from display
- ✅ Auto-sync toggle disabled/hidden
- ✅ "Sync All Logs" button disabled/hidden
- ✅ "Connect Google Calendar" button reappears
- ✅ Refresh token removed from database
- ✅ Calendar settings cleared

**Verification**:
```bash
# Check user document
mongosh
use altheia
db.users.findOne({_id: "test-user-123"}, {google_auth: 1, calendar_settings: 1})

# Should show:
# - google_auth: null or {}
# - calendar_settings.is_enabled: false
# - calendar_settings.calendar_id: null
```

#### Test 2.2: Events After Disconnection
**Objective**: Verify existing events remain in Google Calendar

**Steps**:
1. Create and sync a symptom log
2. Verify event in Google Calendar
3. Disconnect Google Calendar
4. Check Google Calendar again

**Expected Results**:
- ✅ Events remain in Google Calendar after disconnection
- ✅ "Altheia Health" calendar still visible
- ✅ No new events created after disconnection
- ✅ Sync indicators removed from frontend

---

### 3. Single Log Sync

#### Test 3.1: Manual Sync from Calendar Page
**Objective**: Verify individual log can be synced manually

**Steps**:
1. Ensure Google Calendar connected
2. Navigate to Calendar page (`/calendar`)
3. Select a day with symptom logs
4. Click "Sync to Google Calendar" button
5. Wait for completion

**Expected Results**:
- ✅ Button shows loading state (spinner)
- ✅ Success toast notification appears
- ✅ Button changes to "Synced" with checkmark
- ✅ Green checkmark appears on calendar day
- ✅ Event created in Google Calendar
- ✅ Event details match log data

**Test Data**:
```json
{
  "date": "2024-01-15",
  "symptoms": {
    "Hot Flushes": 4,
    "Brain Fog": 2,
    "Mood Swings": 3
  },
  "notes": "Stressful day at work"
}
```

**Google Calendar Verification**:
1. Open Google Calendar
2. Navigate to January 15, 2024
3. Find event in "Altheia Health" calendar
4. Click event to view details

**Expected Event**:
- **Title**: "Symptom Log: Moderate" (based on severity)
- **Calendar**: "Altheia Health"
- **Date**: January 15, 2024 (all-day event)
- **Description**:
  ```
  Symptoms:
  - Hot Flushes: 4/5
  - Brain Fog: 2/5
  - Mood Swings: 3/5
  
  Notes: Stressful day at work
  ```
- **Color**: Yellow (moderate severity)

#### Test 3.2: Auto-Sync on Log Creation
**Objective**: Verify new logs automatically sync when auto-sync enabled

**Steps**:
1. Navigate to Settings
2. Enable "Auto-sync new logs" toggle
3. Navigate to Log page (`/log`)
4. Create a new symptom log
5. Submit the log

**Expected Results**:
- ✅ Log saved successfully
- ✅ Auto-sync indicator shown during save
- ✅ Success message includes sync confirmation
- ✅ Brief delay showing sync status
- ✅ Event created in Google Calendar
- ✅ Redirect to dashboard after completion

**Test Data**:
```json
{
  "date": "2024-01-16",
  "symptoms": {
    "Fatigue": 5,
    "Insomnia": 4
  },
  "notes": "Very tired today"
}
```

#### Test 3.3: Sync with No Notes
**Objective**: Verify sync works when notes field is empty

**Steps**:
1. Create symptom log with symptoms but no notes
2. Sync to Google Calendar

**Expected Results**:
- ✅ Sync succeeds
- ✅ Event created with symptoms only
- ✅ No "Notes:" section in description

**Test Data**:
```json
{
  "date": "2024-01-17",
  "symptoms": {
    "Hot Flushes": 3
  },
  "notes": ""
}
```

#### Test 3.4: Sync with Special Characters
**Objective**: Verify special characters handled correctly

**Steps**:
1. Create log with special characters in notes
2. Sync to Google Calendar
3. Verify event description

**Expected Results**:
- ✅ Special characters preserved
- ✅ Emojis displayed correctly
- ✅ Line breaks maintained
- ✅ No encoding issues

**Test Data**:
```json
{
  "date": "2024-01-18",
  "symptoms": {
    "Mood Swings": 4
  },
  "notes": "Feeling 😔 today\nTried meditation & yoga\nHelped a bit! 🧘‍♀️"
}
```

---

### 4. Batch Sync

#### Test 4.1: Sync All Logs
**Objective**: Verify multiple logs can be synced at once

**Steps**:
1. Create 5 symptom logs on different dates
2. Navigate to Settings page
3. Click "Sync All Logs" button
4. Wait for completion

**Expected Results**:
- ✅ Button shows loading state
- ✅ Progress indicator shown (optional)
- ✅ Success message shows count: "Synced 5 logs successfully"
- ✅ All 5 events created in Google Calendar
- ✅ Each event has correct data
- ✅ Sync indicators appear on all dates

**Test Data**:
```json
[
  {"date": "2024-01-10", "symptoms": {"Hot Flushes": 3}, "notes": "Log 1"},
  {"date": "2024-01-11", "symptoms": {"Brain Fog": 4}, "notes": "Log 2"},
  {"date": "2024-01-12", "symptoms": {"Fatigue": 5}, "notes": "Log 3"},
  {"date": "2024-01-13", "symptoms": {"Insomnia": 2}, "notes": "Log 4"},
  {"date": "2024-01-14", "symptoms": {"Mood Swings": 3}, "notes": "Log 5"}
]
```

**API Test**:
```bash
curl -X POST http://localhost:8000/api/google-calendar/sync-all \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "logs": [...]
  }'

# Expected response:
{
  "success": true,
  "synced_count": 5,
  "failed_count": 0,
  "results": [
    {"log_id": "log1", "success": true, "event_id": "event1"},
    {"log_id": "log2", "success": true, "event_id": "event2"},
    ...
  ]
}
```

#### Test 4.2: Batch Sync with Partial Failures
**Objective**: Verify batch sync handles individual failures gracefully

**Steps**:
1. Create 3 valid logs and 1 with invalid data
2. Attempt batch sync
3. Review results

**Expected Results**:
- ✅ Valid logs synced successfully
- ✅ Invalid log fails gracefully
- ✅ Success message shows: "Synced 3 of 4 logs"
- ✅ Error details available for failed log
- ✅ No rollback of successful syncs

---

### 5. Log Updates and Deletions

#### Test 5.1: Update Synced Log
**Objective**: Verify updating a synced log updates the calendar event

**Steps**:
1. Create and sync a symptom log
2. Note the event ID in Google Calendar
3. Edit the log (change symptoms or notes)
4. Sync again
5. Check Google Calendar

**Expected Results**:
- ✅ Same event updated (not new event created)
- ✅ Event ID remains the same
- ✅ Event details reflect changes
- ✅ Update timestamp recorded

**Test Data**:
```json
// Original
{
  "date": "2024-01-20",
  "symptoms": {"Hot Flushes": 3},
  "notes": "Original notes"
}

// Updated
{
  "date": "2024-01-20",
  "symptoms": {"Hot Flushes": 5, "Brain Fog": 4},
  "notes": "Updated notes - much worse today"
}
```

#### Test 5.2: Delete Synced Log
**Objective**: Verify deleting a log removes the calendar event

**Steps**:
1. Create and sync a symptom log
2. Note the event in Google Calendar
3. Delete the log from application
4. Check Google Calendar

**Expected Results**:
- ✅ Log deleted from application
- ✅ Event removed from Google Calendar
- ✅ "Altheia Health" calendar still exists
- ✅ Other events unaffected

**API Test**:
```bash
curl -X DELETE "http://localhost:8000/api/google-calendar/sync/log123?user_id=test-user-123"

# Expected response:
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### 6. Auto-Sync Toggle

#### Test 6.1: Enable Auto-Sync
**Objective**: Verify auto-sync can be enabled

**Steps**:
1. Navigate to Settings page
2. Locate auto-sync toggle
3. Click to enable
4. Verify state persists

**Expected Results**:
- ✅ Toggle switches to "on" state
- ✅ Success message shown
- ✅ State saved to database
- ✅ State persists after page refresh
- ✅ New logs automatically sync

**Verification**:
```bash
# Check user settings
mongosh
use altheia
db.users.findOne({_id: "test-user-123"}, {"calendar_settings.is_enabled": 1})

# Should show: is_enabled: true
```

#### Test 6.2: Disable Auto-Sync
**Objective**: Verify auto-sync can be disabled

**Steps**:
1. With auto-sync enabled, toggle it off
2. Create a new symptom log
3. Verify it doesn't auto-sync

**Expected Results**:
- ✅ Toggle switches to "off" state
- ✅ State saved to database
- ✅ New logs don't auto-sync
- ✅ Manual sync still available
- ✅ State persists after page refresh

---

### 7. Error Handling

#### Test 7.1: Sync Without Connection
**Objective**: Verify appropriate error when not connected

**Steps**:
1. Ensure Google Calendar disconnected
2. Try to sync a log
3. Observe error message

**Expected Results**:
- ✅ Clear error message: "Google Calendar not connected"
- ✅ Suggestion to connect in Settings
- ✅ No crash or undefined errors
- ✅ Log still saved locally

#### Test 7.2: Network Failure During Sync
**Objective**: Verify graceful handling of network errors

**Steps**:
1. Open browser DevTools → Network tab
2. Set network throttling to "Offline"
3. Try to sync a log
4. Restore network

**Expected Results**:
- ✅ Error message: "Network error, please try again"
- ✅ Sync button returns to normal state
- ✅ Can retry after network restored
- ✅ No data corruption

#### Test 7.3: Invalid Token
**Objective**: Verify handling of expired/invalid tokens

**Steps**:
1. Manually corrupt refresh token in database
2. Try to sync a log
3. Observe error handling

**Expected Results**:
- ✅ Error detected and logged
- ✅ User notified: "Authentication error, please reconnect"
- ✅ Connection status updated to disconnected
- ✅ User can reconnect

#### Test 7.4: API Rate Limiting
**Objective**: Verify handling of Google API rate limits

**Steps**:
1. Rapidly sync many logs (50+)
2. Observe behavior when rate limited

**Expected Results**:
- ✅ Rate limit error caught
- ✅ User notified: "Too many requests, please wait"
- ✅ Retry mechanism in place (optional)
- ✅ No data loss

---

### 8. UI/UX Testing

#### Test 8.1: Loading States
**Objective**: Verify all loading states display correctly

**Checkpoints**:
- [ ] Connect button shows loading spinner
- [ ] Disconnect button shows loading spinner
- [ ] Sync button shows loading spinner
- [ ] Batch sync shows progress
- [ ] Status check shows loading skeleton
- [ ] Buttons disabled during operations

#### Test 8.2: Success Notifications
**Objective**: Verify success messages are clear and helpful

**Checkpoints**:
- [ ] Connection success: "Google Calendar connected"
- [ ] Disconnection success: "Google Calendar disconnected"
- [ ] Sync success: "Log synced to Google Calendar"
- [ ] Batch sync success: "Synced X logs successfully"
- [ ] Auto-sync success: "Auto-sync enabled"

#### Test 8.3: Error Messages
**Objective**: Verify error messages are user-friendly

**Checkpoints**:
- [ ] Connection error: Clear explanation + action
- [ ] Sync error: Specific reason + retry option
- [ ] Network error: "Check connection and try again"
- [ ] Auth error: "Please reconnect Google Calendar"

#### Test 8.4: Visual Indicators
**Objective**: Verify all visual indicators work correctly

**Checkpoints**:
- [ ] Connection badge shows correct status
- [ ] Sync checkmarks appear on calendar
- [ ] Synced button shows green checkmark
- [ ] Auto-sync indicator visible when enabled
- [ ] Calendar legend shows sync indicator

#### Test 8.5: Responsive Design
**Objective**: Verify UI works on different screen sizes

**Test Devices**:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Checkpoints**:
- [ ] Buttons accessible and clickable
- [ ] Text readable without horizontal scroll
- [ ] Modals/dialogs fit screen
- [ ] Touch targets adequate size (mobile)

---

### 9. Data Integrity

#### Test 9.1: Symptom Data Accuracy
**Objective**: Verify symptom data syncs accurately

**Steps**:
1. Create log with multiple symptoms and ratings
2. Sync to Google Calendar
3. Compare event description with original log

**Expected Results**:
- ✅ All symptoms included
- ✅ Ratings accurate (X/5 format)
- ✅ Order preserved
- ✅ No data truncation

#### Test 9.2: Date Accuracy
**Objective**: Verify dates sync correctly across timezones

**Steps**:
1. Create logs on different dates
2. Sync to Google Calendar
3. Verify dates in Google Calendar

**Expected Results**:
- ✅ Dates match exactly
- ✅ All-day events (no time component)
- ✅ Timezone handled correctly
- ✅ No date shifting

#### Test 9.3: Notes Preservation
**Objective**: Verify notes field syncs completely

**Steps**:
1. Create log with long notes (500+ characters)
2. Include line breaks and formatting
3. Sync and verify

**Expected Results**:
- ✅ Full notes included (no truncation)
- ✅ Line breaks preserved
- ✅ Special characters intact
- ✅ Formatting maintained

---

### 10. Security Testing

#### Test 10.1: Token Encryption
**Objective**: Verify tokens are encrypted in database

**Steps**:
1. Connect Google Calendar
2. Check database directly
3. Verify token format

**Expected Results**:
- ✅ Refresh token encrypted (not plaintext)
- ✅ Encryption key not in database
- ✅ Token format: base64 encrypted string
- ✅ Cannot decrypt without key

**Verification**:
```bash
mongosh
use altheia
db.users.findOne({_id: "test-user-123"}, {"google_auth.encrypted_refresh_token": 1})

# Should show encrypted string like:
# "gAAAAABl..."
```

#### Test 10.2: CSRF Protection
**Objective**: Verify state parameter prevents CSRF

**Steps**:
1. Initiate OAuth flow
2. Note state parameter in URL
3. Try to complete flow with different state
4. Verify rejection

**Expected Results**:
- ✅ State parameter generated
- ✅ State validated on callback
- ✅ Mismatched state rejected
- ✅ Error message shown

#### Test 10.3: Authorization Validation
**Objective**: Verify users can only access their own data

**Steps**:
1. Try to sync log for different user
2. Try to check status for different user
3. Verify authorization checks

**Expected Results**:
- ✅ Unauthorized access blocked
- ✅ 401/403 error returned
- ✅ No data leakage
- ✅ Proper error message

---

## 📊 Expected Results Summary

### Success Criteria
- ✅ All OAuth flows complete successfully
- ✅ Tokens encrypted and stored securely
- ✅ All sync operations work correctly
- ✅ Error handling is graceful and informative
- ✅ UI is responsive and user-friendly
- ✅ Data integrity maintained
- ✅ Security measures effective

### Performance Benchmarks
- OAuth flow: < 5 seconds
- Single sync: < 2 seconds
- Batch sync (10 logs): < 10 seconds
- Status check: < 500ms
- Page load: < 1 second

---

## 🐛 Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
**Solution**: Verify redirect URI in `.env` exactly matches Google Cloud Console

### Issue: No refresh token received
**Solution**: Revoke access at https://myaccount.google.com/permissions and reconnect

### Issue: Events not appearing
**Solution**: Check "Altheia Health" calendar is visible in Google Calendar

### Issue: Decryption errors
**Solution**: Verify `ENCRYPTION_KEY` hasn't changed; users must reconnect if it has

### Issue: Sync fails silently
**Solution**: Check backend logs, verify auto-sync enabled, check connection status

---

## 🧪 Test Data Templates

### Minimal Log
```json
{
  "date": "2024-01-15",
  "symptoms": {"Hot Flushes": 3},
  "notes": ""
}
```

### Complete Log
```json
{
  "date": "2024-01-15",
  "symptoms": {
    "Hot Flushes": 4,
    "Brain Fog": 2,
    "Mood Swings": 3,
    "Fatigue": 5,
    "Insomnia": 4
  },
  "notes": "Very challenging day. Multiple symptoms. Tried meditation which helped slightly."
}
```

### Edge Case Log
```json
{
  "date": "2024-01-15",
  "symptoms": {"Test Symptom": 1},
  "notes": "Special chars: !@#$%^&*()\nEmojis: 😊🌟\nUnicode: café, naïve"
}
```

---

## 🤖 Automated Testing

### Backend Unit Tests
```python
# tests/test_google_calendar.py
def test_encrypt_decrypt_token():
    """Test token encryption/decryption"""
    pass

def test_oauth_flow():
    """Test OAuth authentication flow"""
    pass

def test_sync_log():
    """Test single log sync"""
    pass

def test_batch_sync():
    """Test batch sync operation"""
    pass
```

### Frontend Integration Tests
```typescript
// tests/google-calendar.test.ts
describe('Google Calendar Integration', () => {
  test('connects successfully', async () => {});
  test('syncs log to calendar', async () => {});
  test('handles errors gracefully', async () => {});
});
```

### End-to-End Tests
```typescript
// e2e/google-calendar.spec.ts
test('complete OAuth flow', async ({ page }) => {
  // Test full user journey
});
```

---

## ✅ Final Testing Checklist

### Pre-Production
- [ ] All manual tests passed
- [ ] All automated tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Documentation reviewed
- [ ] User acceptance testing completed

### Production Readiness
- [ ] Production credentials configured
- [ ] HTTPS enabled
- [ ] Monitoring set up
- [ ] Backup procedures tested
- [ ] Rollback plan documented
- [ ] Support team trained

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Ready for Testing