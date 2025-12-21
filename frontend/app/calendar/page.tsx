"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import Card from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { GoogleCalendarSyncButton } from '@/components/google-calendar-sync-button';
import { syncSymptomLog } from '@/lib/google-calendar-api';
import { toast } from 'sonner';

export default function CalendarPage() {
  const { logs, user, googleCalendar, markLogAsSynced } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate padding days for start of month
  const startDay = getDay(monthStart);
  const paddingDays = Array(startDay).fill(null);

  const getLogForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs.find(log => log.date === dateStr);
  };

  const getIntensityColor = (severity: number) => {
    if (severity >= 4) return 'bg-rose-500';
    if (severity >= 3) return 'bg-rose-400';
    if (severity >= 2) return 'bg-rose-300';
    return 'bg-rose-200';
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const selectedLog = selectedDate ? getLogForDate(selectedDate) : null;

  const handleSyncLog = async (log: typeof logs[0]) => {
    if (!user?.id) {
      toast.error('Please log in to sync to Google Calendar');
      return;
    }

    if (!googleCalendar.connected) {
      toast.error('Please connect Google Calendar in Settings first');
      return;
    }

    try {
      const result = await syncSymptomLog(
        user.id,
        log.id,
        log.date,
        log.symptoms,
        log.notes
      );

      if (result.success && result.event_id) {
        markLogAsSynced(log.id, result.event_id);
        toast.success('Log synced to Google Calendar!');
      }
    } catch (error) {
      toast.error('Failed to sync log to Google Calendar');
      console.error('Sync error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Symptom History</h1>
        <p className="text-slate-600 mt-1">View your tracking history and patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {paddingDays.map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              
              {daysInMonth.map((date) => {
                const log = getLogForDate(date);
                const maxSeverity = log 
                  ? Math.max(...log.symptoms.map(s => s.severity)) 
                  : 0;
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                return (
                  <button
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "aspect-square rounded-xl relative flex items-center justify-center transition-all duration-200 border-2",
                      isSelected ? "border-slate-900 z-10 scale-105 shadow-lg" : "border-transparent hover:border-slate-200",
                      log ? getIntensityColor(maxSeverity) : "bg-slate-50",
                      log ? "text-white" : "text-slate-700"
                    )}
                  >
                    <span className={cn("text-sm font-medium", isToday && !log && "text-rose-600 font-bold")}>
                      {format(date, 'd')}
                    </span>
                    {log?.syncedToCalendar && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                      </div>
                    )}
                    {isToday && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-50" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-rose-200" /> Mild
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-rose-300" /> Moderate
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-rose-400" /> Severe
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-rose-500" /> Very Severe
                </div>
              </div>
              {googleCalendar.connected && (
                <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Synced to Google Calendar</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Detail View */}
        <div>
          <Card className="p-6 h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-rose-500" />
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>

            {selectedDate ? (
              selectedLog ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-3">Symptoms Logged</h4>
                    <div className="space-y-3">
                      {selectedLog.symptoms.map((symptom, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-slate-700">{symptom.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${(symptom.severity / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-600 w-4 text-right">
                              {symptom.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedLog.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Notes</h4>
                      <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg italic">
                        &quot;{selectedLog.notes}&quot;
                      </p>
                    </div>
                  )}

                  {googleCalendar.connected && (
                    <div className="pt-4 border-t border-slate-100">
                      <GoogleCalendarSyncButton
                        onSync={() => handleSyncLog(selectedLog)}
                        synced={selectedLog.syncedToCalendar}
                        className="w-full"
                        size="md"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>No data logged for this day.</p>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>Click on a date to view details.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

