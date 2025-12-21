"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleCalendarStatusProps {
  connected: boolean;
  email?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function GoogleCalendarStatus({
  connected,
  email,
  className,
  showIcon = true,
  size = 'md',
}: GoogleCalendarStatusProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (connected) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <CheckCircle2 className={cn(iconSizes[size], 'mr-1.5')} />}
        <span className="font-medium">Connected</span>
        {email && size !== 'sm' && (
          <span className="ml-1.5 text-green-600 font-normal">({email})</span>
        )}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <XCircle className={cn(iconSizes[size], 'mr-1.5')} />}
      <span className="font-medium">Not Connected</span>
    </Badge>
  );
}

interface GoogleCalendarIconProps {
  connected: boolean;
  className?: string;
}

export function GoogleCalendarIcon({ connected, className }: GoogleCalendarIconProps) {
  return (
    <div className={cn('relative', className)}>
      <Calendar className={cn('w-5 h-5', connected ? 'text-green-600' : 'text-slate-400')} />
      {connected && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
      )}
    </div>
  );
}