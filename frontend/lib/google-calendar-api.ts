/**
 * Google Calendar API Client
 * Handles all communication with the backend Google Calendar endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/google-calendar` : 'http://localhost:8000/api/google-calendar';

const getAuthHeaders = () => {
  const token = localStorage.getItem('aletheia_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export interface GoogleCalendarStatus {
  connected: boolean;
  email?: string;
  calendar_id?: string;
}

export interface SyncResponse {
  success: boolean;
  event_id?: string;
  message?: string;
  error?: string;
}

export interface BatchSyncResponse {
  success: boolean;
  synced_count: number;
  failed_count: number;
  errors?: string[];
}

/**
 * Check if user has connected their Google Calendar
 */
export async function getGoogleCalendarStatus(userId: string): Promise<GoogleCalendarStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/status?user_id=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch Google Calendar status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Google Calendar status:', error);
    throw error;
  }
}

/**
 * Initiate Google OAuth flow
 * Returns the authorization URL to redirect the user to
 */
export async function initiateGoogleAuth(userId: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/initiate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to initiate Google authentication');
    }
    
    const data = await response.json();
    return data.auth_url;
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    throw error;
  }
}

/**
 * Handle OAuth callback after user authorizes
 */
export async function handleGoogleAuthCallback(
  code: string,
  state: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/callback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, state }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to complete Google authentication');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error handling Google auth callback:', error);
    throw error;
  }
}

/**
 * Disconnect Google Calendar integration
 */
export async function disconnectGoogleCalendar(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/disconnect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to disconnect Google Calendar');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    throw error;
  }
}

/**
 * Sync a single symptom log to Google Calendar
 */
export async function syncSymptomLog(
  userId: string,
  logId: string,
  date: string,
  symptoms: Array<{ name: string; severity: number }>,
  notes?: string
): Promise<SyncResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sync`, { // Endpoint changed to match backend router '/sync' not '/sync/log' based on google_calendar_sync.py line 123
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        // user_id: userId, // User ID is now inferred from token in backend
        log_id: logId,
        // date, // Backend seems to only take log_id in SyncLogRequest
        // symptoms,
        // notes,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to sync symptom log');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error syncing symptom log:', error);
    throw error;
  }
}

/**
 * Sync all symptom logs to Google Calendar
 */
export async function syncAllLogs(
  userId: string,
  logs: Array<{
    id: string;
    date: string;
    symptoms: Array<{ name: string; severity: number }>;
    notes?: string;
  }>
): Promise<BatchSyncResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sync-all`, { // Endpoint changed to match backend router '/sync-all'
      method: 'POST',
      headers: getAuthHeaders(),
      // Body not needed for sync-all as per backend signature, it fetches from DB
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to sync logs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error syncing all logs:', error);
    throw error;
  }
}

/**
 * Delete a synced symptom log from Google Calendar
 */
export async function deleteSymptomLogFromCalendar(
  userId: string,
  logId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/sync/${logId}`, { // Endpoint changed to DELETE /sync/{log_id}
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete event from calendar');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting symptom log from calendar:', error);
    throw error;
  }
}