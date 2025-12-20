"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import { User, Download, Trash2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, updateProfile, logout } = useApp();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

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


