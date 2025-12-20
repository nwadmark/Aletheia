"use client";

import React, { useState, useMemo } from 'react';
import { useApp, SYMPTOMS_LIST } from '@/lib/store';
import Card from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Filter } from 'lucide-react';
import Button from '@/components/ui/button';

export default function TrendsPage() {
  const { logs } = useApp();
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('7');
  const [selectedSymptom, setSelectedSymptom] = useState<string>('All');

  const chartData = useMemo(() => {
    const days = parseInt(timeRange);
    const now = new Date();
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const log = logs.find(l => l.date === dateStr);
      
      const entry: {
        date: string;
        count: number;
        severity?: number;
        avgSeverity?: string | number;
      } = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: log ? log.symptoms.length : 0,
      };

      if (selectedSymptom !== 'All') {
        const symptom = log?.symptoms.find(s => s.name === selectedSymptom);
        entry.severity = symptom ? symptom.severity : 0;
      } else {
        // Average severity for all symptoms
        if (log && log.symptoms.length > 0) {
          const totalSeverity = log.symptoms.reduce((acc, s) => acc + s.severity, 0);
          entry.avgSeverity = (totalSeverity / log.symptoms.length).toFixed(1);
        } else {
          entry.avgSeverity = 0;
        }
      }

      data.push(entry);
    }
    return data;
  }, [logs, timeRange, selectedSymptom]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalLogs = chartData.filter(d => d.count > 0).length;
    const avgIntensity = chartData.reduce((acc, curr) => acc + (Number(curr.avgSeverity) || Number(curr.severity) || 0), 0) / (totalLogs || 1);
    
    return {
      daysTracked: totalLogs,
      avgIntensity: avgIntensity.toFixed(1)
    };
  }, [chartData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Trends & Insights</h1>
          <p className="text-slate-600 mt-1">Visualize your symptom patterns over time.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            className="block w-full md:w-48 rounded-lg border-slate-200 text-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
            value={selectedSymptom}
            onChange={(e) => setSelectedSymptom(e.target.value)}
          >
            <option value="All">All Symptoms</option>
            {SYMPTOMS_LIST.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          {['7', '14', '30'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as '7' | '14' | '30')}
              className={cn(
                "flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                timeRange === range 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {range} Days
            </button>
          ))}
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Days Tracked</p>
          <p className="text-3xl font-bold text-slate-900">{stats.daysTracked} <span className="text-sm font-normal text-slate-400">/ {timeRange}</span></p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Avg Intensity</p>
          <p className="text-3xl font-bold text-slate-900">{stats.avgIntensity} <span className="text-sm font-normal text-slate-400">/ 5</span></p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Most Active Symptom</p>
          <p className="text-xl font-bold text-slate-900 truncate">
            {selectedSymptom === 'All' ? 'Hot Flushes' : selectedSymptom} {/* Mock logic for MVP */}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Symptom Frequency</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Symptoms Logged" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Intensity Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={selectedSymptom === 'All' ? "avgSeverity" : "severity"} 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Severity (1-5)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

