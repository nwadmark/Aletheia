"use client";

import React from 'react';
import { AppProvider } from '@/lib/store';
import Navbar from '@/components/navbar';
import { Chatbot } from '@/components/chatbot';
import { Toaster } from 'sonner';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <AppProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Chatbot />
          <Toaster position="bottom-right" />
        </AppProvider>
      </body>
    </html>
  );
}

