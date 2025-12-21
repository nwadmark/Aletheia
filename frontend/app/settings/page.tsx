"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { User, Download, Trash2, LogOut, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleCalendarStatus } from '@/components/google-calendar-status';
import { BatchSyncButton } from '@/components/google-calendar-sync-button';
import {
  getGoogleCalendarStatus,
  initiateGoogleAuth,
  disconnectGoogleCalendar,
  handleGoogleAuthCallback,
  syncAllLogs,
} from '@/lib/google-calendar-api';

export default function SettingsPage() {
  const {
    user,
    updateProfile,
    logout,
    logs,
    googleCalendar,
    setGoogleCalendarConnected,
    setGoogleCalendarAutoSync,
  } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, [searchParams]);

  // Load Google Calendar status on mount
  useEffect(() => {
    if (user?.id) {
      loadGoogleCalendarStatus();
    }
  }, [user?.id]);

  const loadGoogleCalendarStatus = async () => {
    if (!user?.id) return;
    
    try {
      const status = await getGoogleCalendarStatus(user.id);
      setGoogleCalendarConnected(status.connected, status.email, status.calendar_id);
    } catch (error) {
      console.error('Failed to load Google Calendar status:', error);
    }
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      const result = await handleGoogleAuthCallback(code, state);
      if (result.success) {
        toast.success('Google Calendar connected successfully!');
        await loadGoogleCalendarStatus();
        // Clean up URL
        router.replace('/settings');
      }
    } catch (error) {
      toast.error('Failed to connect Google Calendar. Please try again.');
      console.error('OAuth callback error:', error);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    if (!user?.id) return;
    
    setIsLoadingCalendar(true);
    try {
      const authUrl = await initiateGoogleAuth(user.id);
      window.location.href = authUrl;
    } catch (error) {
      toast.error('Failed to initiate Google Calendar connection');
      console.error('Error connecting Google Calendar:', error);
      setIsLoadingCalendar(false);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    if (!user?.id) return;
    
    setIsLoadingCalendar(true);
    try {
      await disconnectGoogleCalendar(user.id);
      setGoogleCalendarConnected(false);
      toast.success('Google Calendar disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect Google Calendar');
      console.error('Error disconnecting Google Calendar:', error);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleSyncAllLogs = async () => {
    if (!user?.id || logs.length === 0) return;
    
    try {
      const result = await syncAllLogs(user.id, logs);
      if (result.success) {
        toast.success(`Successfully synced ${result.synced_count} logs to Google Calendar`);
        if (result.failed_count > 0) {
          toast.warning(`${result.failed_count} logs failed to sync`);
        }
      }
    } catch (error) {
      toast.error('Failed to sync logs to Google Calendar');
      console.error('Error syncing logs:', error);
    }
  };

  const handleAutoSyncToggle = (checked: boolean) => {
    setGoogleCalendarAutoSync(checked);
    toast.success(`Auto-sync ${checked ? 'enabled' : 'disabled'}`);
  };

  if (!user) return null;

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleExport = () => {
    toast.success('Exporting data... Your download will start shortly.');
    // Mock export
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob(["Date,Symptom,Severity,Notes\n2023-10-01,Hot Flushes,4,Stressful day"], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "aletheia-data.csv";
      document.body.appendChild(element);
      element.click();
    }, 1500);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-rose-500" />
              Profile Information
            </h2>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email Address"
              value={formData.email}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Age Range</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-sm">
                  {user.ageRange || 'Not set'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-sm truncate">
                  {user.menstrualStatus || 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Google Calendar Integration */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              Google Calendar Integration
            </h2>
            <GoogleCalendarStatus
              connected={googleCalendar.connected}
              email={googleCalendar.email}
            />
          </div>

          <div className="space-y-4">
            {!googleCalendar.connected ? (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h3 className="font-medium text-slate-900">Connect Your Calendar</h3>
                  <p className="text-sm text-slate-500">
                    Sync your symptom logs to Google Calendar for easy tracking
                  </p>
                </div>
                <Button
                  onClick={handleConnectGoogleCalendar}
                  disabled={isLoadingCalendar}
                  isLoading={isLoadingCalendar}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                  <div>
                    <h3 className="font-medium text-slate-900">Calendar Connected</h3>
                    <p className="text-sm text-green-600">
                      {googleCalendar.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDisconnectGoogleCalendar}
                    disabled={isLoadingCalendar}
                    isLoading={isLoadingCalendar}
                  >
                    Disconnect
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h3 className="font-medium text-slate-900">Auto-Sync New Logs</h3>
                    <p className="text-sm text-slate-500">
                      Automatically sync new symptom logs to your calendar
                    </p>
                  </div>
                  <Switch
                    checked={googleCalendar.autoSync}
                    onCheckedChange={handleAutoSyncToggle}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h3 className="font-medium text-slate-900">Sync All Logs</h3>
                    <p className="text-sm text-slate-500">
                      Sync all existing symptom logs to Google Calendar
                    </p>
                  </div>
                  <BatchSyncButton
                    onSync={handleSyncAllLogs}
                    totalLogs={logs.length}
                    disabled={logs.length === 0}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Download className="w-5 h-5 text-rose-500" />
            Data Management
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h3 className="font-medium text-slate-900">Export Your Data</h3>
                <p className="text-sm text-slate-500">Download a CSV copy of all your symptom logs.</p>
              </div>
              <Button variant="outline" onClick={handleExport}>
                Export CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6 border-red-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Account Actions
          </h2>
          
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
            
            <div className="pt-4 border-t border-slate-100">
              <Button 
                variant="danger" 
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none"
              >
                Delete Account
              </Button>
              <p className="text-xs text-slate-400 mt-2 text-center">
                This action cannot be undone. All your data will be permanently removed.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


