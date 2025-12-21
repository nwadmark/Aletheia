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
  logs: SymptomLog[];
  bookmarks: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  googleCalendar: GoogleCalendarState;
};

type AppContextType = AppState & {
  login: (email: string, name: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  completeOnboarding: (data: Partial<User>) => void;
  addLog: (log: Omit<SymptomLog, 'id' | 'timestamp'>) => void;
  updateLog: (id: string, log: Partial<SymptomLog>) => void;
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
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [googleCalendar, setGoogleCalendar] = useState<GoogleCalendarState>({
    connected: false,
    autoSync: false,
  });

  // Load from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('aletheia_user');
    const storedLogs = localStorage.getItem('aletheia_logs');
    const storedBookmarks = localStorage.getItem('aletheia_bookmarks');
    const storedGoogleCalendar = localStorage.getItem('aletheia_google_calendar');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedLogs) setLogs(JSON.parse(storedLogs));
    if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
    if (storedGoogleCalendar) setGoogleCalendar(JSON.parse(storedGoogleCalendar));
    
    setIsLoading(false);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (user) localStorage.setItem('aletheia_user', JSON.stringify(user));
    else localStorage.removeItem('aletheia_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aletheia_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('aletheia_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('aletheia_google_calendar', JSON.stringify(googleCalendar));
  }, [googleCalendar]);

  const login = (email: string, name: string) => {
    const newUser: User = {
      id: generateId(),
      name,
      email,
      ageRange: '',
      menstrualStatus: '',
      primarySymptoms: [],
      onboardingCompleted: false,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setLogs([]);
    setBookmarks([]);
    localStorage.clear();
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...data });
  };

  const completeOnboarding = (data: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...data, onboardingCompleted: true });
  };

  const addLog = (logData: Omit<SymptomLog, 'id' | 'timestamp'>) => {
    const newLog: SymptomLog = {
      ...logData,
      id: generateId(),
      timestamp: Date.now(),
    };
    
    // Remove existing log for same date if exists
    const filteredLogs = logs.filter(l => l.date !== logData.date);
    setLogs([...filteredLogs, newLog]);
  };

  const updateLog = (id: string, logData: Partial<SymptomLog>) => {
    setLogs(logs.map(log => log.id === id ? { ...log, ...logData } : log));
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

