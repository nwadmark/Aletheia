"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/button';
import { Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleCalendarSyncButtonProps {
  onSync: () => Promise<void>;
  disabled?: boolean;
  synced?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function GoogleCalendarSyncButton({
  onSync,
  disabled = false,
  synced = false,
  variant = 'outline',
  size = 'sm',
  className,
  showIcon = true,
  children,
}: GoogleCalendarSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onSync();
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = children || (synced ? 'Synced' : 'Sync to Calendar');

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={disabled || isLoading}
      className={cn(
        synced && 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          {showIcon && (
            synced ? (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            ) : (
              <Calendar className="w-4 h-4 mr-2" />
            )
          )}
          {buttonContent}
        </>
      )}
    </Button>
  );
}

interface BatchSyncButtonProps {
  onSync: () => Promise<void>;
  disabled?: boolean;
  totalLogs: number;
  className?: string;
}

export function BatchSyncButton({
  onSync,
  disabled = false,
  totalLogs,
  className,
}: BatchSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onSync();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={disabled || isLoading || totalLogs === 0}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Syncing {totalLogs} logs...
        </>
      ) : (
        <>
          <Calendar className="w-4 h-4 mr-2" />
          Sync All Logs ({totalLogs})
        </>
      )}
    </Button>
  );
}