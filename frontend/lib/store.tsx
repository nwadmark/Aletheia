"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from './utils';

// Types
export type User = {
  id: string;
  name: string;
  email: string;
  ageRange: string;
  menstrualStatus: string;
  primarySymptoms: string[];
  onboardingCompleted: boolean;
};

export type SymptomLog = {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  symptoms: {
    name: string;
    severity: number; // 1-5
  }[];
  notes: string;
  timestamp: number;
  syncedToCalendar?: boolean;
  calendarEventId?: string;
};

export type Article = {
  id: string;
  title: string;
  category: 'Symptoms' | 'Nutrition' | 'Essential';
  content: string;
  readTime: string;
  tags: string[];
  image?: string;
};

type GoogleCalendarState = {
  connected: boolean;
  email?: string;
  calendarId?: string;
  autoSync: boolean;
};

type AppState = {
  user: User | null;
  token: string | null;
  logs: SymptomLog[];
  bookmarks: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  googleCalendar: GoogleCalendarState;
};

type AppContextType = AppState & {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  completeOnboarding: (data: Partial<User>) => void;
  addLog: (log: Omit<SymptomLog, 'id' | 'timestamp'>) => Promise<string | null>;
  updateLog: (id: string, log: Partial<SymptomLog>) => Promise<void>;
  toggleBookmark: (articleId: string) => void;
  getLogByDate: (date: string) => SymptomLog | undefined;
  setGoogleCalendarConnected: (connected: boolean, email?: string, calendarId?: string) => void;
  setGoogleCalendarAutoSync: (autoSync: boolean) => void;
  markLogAsSynced: (logId: string, eventId: string) => void;
  markLogAsUnsynced: (logId: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Data
export const SYMPTOMS_LIST = [
  "Hot Flushes",
  "Night Sweats",
  "Sleep Quality",
  "Mood Changes",
  "Brain Fog",
  "Joint Pain",
  "Energy Levels",
  "Anxiety"
];

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Understanding Perimenopause: The First Signs',
    category: 'Essential',
    content: 'Perimenopause can start as early as your mid-30s...',
    readTime: '5 min',
    tags: ['Perimenopause', 'Basics'],
    image: 'bg-rose-100'
  },
  {
    id: '2',
    title: 'Nutrition Strategies for Hot Flushes',
    category: 'Nutrition',
    content: 'Certain foods can trigger hot flushes while others help cool you down...',
    readTime: '4 min',
    tags: ['Diet', 'Hot Flushes'],
    image: 'bg-orange-100'
  },
  {
    id: '3',
    title: 'Sleep Hygiene During Menopause',
    category: 'Symptoms',
    content: 'Sleep disruption is one of the most common complaints...',
    readTime: '6 min',
    tags: ['Sleep', 'Self-care'],
    image: 'bg-indigo-100'
  },
  {
    id: '4',
    title: 'Brain Fog: Why It Happens and What Helps',
    category: 'Symptoms',
    content: 'Forgetting names or why you walked into a room? You are not alone...',
    readTime: '4 min',
    tags: ['Brain Fog', 'Cognition'],
    image: 'bg-blue-100'
  },
  {
    id: '5',
    title: 'Supplements: What Science Actually Supports',
    category: 'Nutrition',
    content: 'Navigating the world of supplements can be overwhelming...',
    readTime: '7 min',
    tags: ['Supplements', 'Health'],
    image: 'bg-green-100'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [googleCalendar, setGoogleCalendar] = useState<GoogleCalendarState>({
    connected: false,
    autoSync: false,
  });

  // Load from local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('aletheia_token');
    const storedUser = localStorage.getItem('aletheia_user');
    // const storedLogs = localStorage.getItem('aletheia_logs'); // Logs now come from API
    const storedBookmarks = localStorage.getItem('aletheia_bookmarks');
    const storedGoogleCalendar = localStorage.getItem('aletheia_google_calendar');

    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
    // if (storedLogs) setLogs(JSON.parse(storedLogs));
    if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
    if (storedGoogleCalendar) setGoogleCalendar(JSON.parse(storedGoogleCalendar));
    
    setIsLoading(false);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (token) localStorage.setItem('aletheia_token', token);
    else localStorage.removeItem('aletheia_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('aletheia_user', JSON.stringify(user));
    else localStorage.removeItem('aletheia_user');
  }, [user]);

  /*
  // Logs are now fetched from API, not persisted in local storage
  useEffect(() => {
    localStorage.setItem('aletheia_logs', JSON.stringify(logs));
  }, [logs]);
  */

  useEffect(() => {
    localStorage.setItem('aletheia_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('aletheia_google_calendar', JSON.stringify(googleCalendar));
  }, [googleCalendar]);

  // Fetch logs when user/token changes
  useEffect(() => {
    if (token && user) {
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [token, user]);

  const fetchLogs = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/logs/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Map API response to SymptomLog type if needed
        const mappedLogs: SymptomLog[] = data.map((log: any) => ({
          id: log.id,
          date: log.date,
          symptoms: log.symptoms,
          notes: log.overall_notes || '',
          timestamp: new Date(log.updated_at).getTime(),
          // syncedToCalendar: log.syncedToCalendar, // Need to handle this if backend supports it
          // calendarEventId: log.calendarEventId
        }));
        setLogs(mappedLogs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  // Helper to map API response (snake_case) to Frontend User (camelCase)
  const mapUserFromApi = (apiUser: any): User => {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      ageRange: apiUser.age_range,
      menstrualStatus: apiUser.menstrual_status,
      primarySymptoms: apiUser.primary_symptoms,
      onboardingCompleted: apiUser.onboarding_completed,
    };
  };

  const login = (accessToken: string, userData: any) => {
    setToken(accessToken);
    const mappedUser = mapUserFromApi(userData);
    setUser(mappedUser);
    
    // Update Google Calendar state based on user data
    if (userData.calendar_connected !== undefined) {
       setGoogleCalendar(prev => ({
         ...prev,
         connected: userData.calendar_connected,
         autoSync: userData.calendar_sync_enabled || false,
       }));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLogs([]);
    setBookmarks([]);
    localStorage.removeItem('aletheia_token');
    localStorage.removeItem('aletheia_user');
    // Keep bookmarks maybe? Or clear everything.
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user || !token) return;
    
    // Optimistic update
    setUser({ ...user, ...data });

    // Map camelCase to snake_case for API
    const apiPayload: any = { ...data };
    if (data.ageRange) apiPayload.age_range = data.ageRange;
    if (data.menstrualStatus) apiPayload.menstrual_status = data.menstrualStatus;
    if (data.primarySymptoms) apiPayload.primary_symptoms = data.primarySymptoms;
    if (data.onboardingCompleted !== undefined) apiPayload.onboarding_completed = data.onboardingCompleted;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiPayload)
      });

      if (response.ok) {
        const updatedUserApi = await response.json();
        setUser(mapUserFromApi(updatedUserApi));
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const completeOnboarding = async (data: Partial<User>) => {
    if (!user || !token) return;
    
    // Optimistic update
    const updatedUser = { ...user, ...data, onboardingCompleted: true };
    setUser(updatedUser);

    // Map camelCase to snake_case for API
    const apiPayload: any = {};
    if (data.ageRange) apiPayload.age_range = data.ageRange;
    if (data.menstrualStatus) apiPayload.menstrual_status = data.menstrualStatus;
    if (data.primarySymptoms) apiPayload.primary_symptoms = data.primarySymptoms;
    // Always set true for this method
    apiPayload.onboarding_completed = true;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiPayload)
      });

      if (response.ok) {
        const serverUserApi = await response.json();
        setUser(mapUserFromApi(serverUserApi));
      } else {
        console.error("Failed to save onboarding data");
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    }
  };

  const addLog = async (logData: Omit<SymptomLog, 'id' | 'timestamp'>): Promise<string | null> => {
    if (!token) return null;

    // Optimistic update
    const tempId = generateId();
    const newLog: SymptomLog = {
      ...logData,
      id: tempId,
      timestamp: Date.now(),
    };
    
    const filteredLogs = logs.filter(l => l.date !== logData.date);
    setLogs([...filteredLogs, newLog]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/logs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: logData.date,
          symptoms: logData.symptoms,
          overall_notes: logData.notes
        })
      });

      if (response.ok) {
        const savedLog = await response.json();
        // Update with real ID from backend
        setLogs(prevLogs => prevLogs.map(l => l.id === tempId ? {
          ...l,
          id: savedLog.id,
          timestamp: new Date(savedLog.updated_at).getTime()
        } : l));
        return savedLog.id;
      } else {
        // Revert on failure? Or show error
        console.error("Failed to save log");
        return null;
      }
    } catch (error) {
      console.error("Error saving log:", error);
      return null;
    }
  };

  const updateLog = async (id: string, logData: Partial<SymptomLog>) => {
    // For now, addLog handles upsert (create or update) based on date on the backend
    // So if we have the date, we can just use addLog logic essentially,
    // but we might need to be careful if we are only updating partial fields.
    // The backend upsert replaces the symptoms list.
    
    // Find the current log to get the date if not provided
    const currentLog = logs.find(l => l.id === id);
    if (!currentLog) return;

    const updatedLogCombined = { ...currentLog, ...logData };
    
    // Optimistic update
    setLogs(logs.map(log => log.id === id ? updatedLogCombined : log));

    if (!token) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/logs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: updatedLogCombined.date,
          symptoms: updatedLogCombined.symptoms,
          overall_notes: updatedLogCombined.notes
        })
      });
    } catch (error) {
       console.error("Error updating log:", error);
    }
  };

  const toggleBookmark = (articleId: string) => {
    if (bookmarks.includes(articleId)) {
      setBookmarks(bookmarks.filter(id => id !== articleId));
    } else {
      setBookmarks([...bookmarks, articleId]);
    }
  };

  const getLogByDate = (date: string) => {
    return logs.find(log => log.date === date);
  };

  const setGoogleCalendarConnected = (connected: boolean, email?: string, calendarId?: string) => {
    setGoogleCalendar(prev => ({
      ...prev,
      connected,
      email: connected ? email : undefined,
      calendarId: connected ? calendarId : undefined,
    }));
  };

  const setGoogleCalendarAutoSync = (autoSync: boolean) => {
    setGoogleCalendar(prev => ({ ...prev, autoSync }));
  };

  const markLogAsSynced = (logId: string, eventId: string) => {
    setLogs(logs.map(log =>
      log.id === logId
        ? { ...log, syncedToCalendar: true, calendarEventId: eventId }
        : log
    ));
  };

  const markLogAsUnsynced = (logId: string) => {
    setLogs(logs.map(log =>
      log.id === logId
        ? { ...log, syncedToCalendar: false, calendarEventId: undefined }
        : log
    ));
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      logs,
      bookmarks,
      isAuthenticated: !!user,
      isLoading,
      googleCalendar,
      login,
      logout,
      updateProfile,
      completeOnboarding,
      addLog,
      updateLog,
      toggleBookmark,
      getLogByDate,
      setGoogleCalendarConnected,
      setGoogleCalendarAutoSync,
      markLogAsSynced,
      markLogAsUnsynced,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

