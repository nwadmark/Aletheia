"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, SYMPTOMS_LIST } from '@/lib/store';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { Save, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function LogPage() {
  const router = useRouter();
  const { addLog, getLogByDate, user } = useApp();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severities, setSeverities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  // Load existing log if editing
  useEffect(() => {
    const existingLog = getLogByDate(date);
    if (existingLog) {
      setSelectedSymptoms(existingLog.symptoms.map(s => s.name));
      const severityMap: Record<string, number> = {};
      existingLog.symptoms.forEach(s => {
        severityMap[s.name] = s.severity;
      });
      setSeverities(severityMap);
      setNotes(existingLog.notes);
    } else {
      // Reset form if no log for this date
      setSelectedSymptoms([]);
      setSeverities({});
      setNotes('');
      
      // Pre-select primary symptoms from profile if new log
      if (user?.primarySymptoms) {
        setSelectedSymptoms(user.primarySymptoms);
        const initialSeverities: Record<string, number> = {};
        user.primarySymptoms.forEach(s => {
          initialSeverities[s] = 3; // Default middle severity
        });
        setSeverities(initialSeverities);
      }
    }
  }, [date, getLogByDate, user]);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
      const newSeverities = { ...severities };
      delete newSeverities[symptom];
      setSeverities(newSeverities);
    } else {
      setSelectedSymptoms(prev => [...prev, symptom]);
      setSeverities(prev => ({ ...prev, [symptom]: 3 })); // Default to 3
    }
  };

  const handleSeverityChange = (symptom: string, value: number) => {
    setSeverities(prev => ({ ...prev, [symptom]: value }));
  };

  const handleSave = () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    const symptomsData = selectedSymptoms.map(name => ({
      name,
      severity: severities[name] || 3
    }));

    addLog({
      date,
      symptoms: symptomsData,
      notes
    });

    toast.success('Log saved successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Log Symptoms</h1>
      </div>

      <div className="space-y-6">
        {/* Date Selection */}
        <Card className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-3 border"
          />
        </Card>

        {/* Symptom Selection */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">What are you experiencing?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SYMPTOMS_LIST.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={cn(
                  "p-3 rounded-xl text-sm font-medium transition-all duration-200 border",
                  selectedSymptoms.includes(symptom)
                    ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                {symptom}
              </button>
            ))}
          </div>
        </Card>

        {/* Severity Ratings */}
        {selectedSymptoms.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-6">How severe is it?</h2>
            <div className="space-y-8">
              {selectedSymptoms.map((symptom) => (
                <div key={symptom} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-900">{symptom}</label>
                    <span className="text-sm font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                      {severities[symptom]}/5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={severities[symptom] || 3}
                    onChange={(e) => handleSeverityChange(symptom, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes */}
        <Card className="p-6">
          <label className="block text-lg font-medium text-slate-900 mb-4">Notes (Optional)</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else you want to record? (Triggers, diet, sleep, etc.)"
            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-3 border resize-none"
          />
        </Card>

        <div className="flex justify-end pt-4 pb-12">
          <Button size="lg" onClick={handleSave} className="w-full sm:w-auto px-12">
            <Save className="w-4 h-4 mr-2" />
            Save Log
          </Button>
        </div>
      </div>
    </div>
  );
}

