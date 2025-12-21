"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from '@/lib/store';

type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Hello! I am your women\'s health assistant. I can help with questions about menopause and related symptoms. How can I help you today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { token } = useApp();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if available
           ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: userMessage.content })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.response
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg shadow-rose-500/20 z-50 transition-transform hover:scale-110 !px-0"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="sr-only">Open Chatbot</span>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-rose-500/20 animate-in slide-in-from-bottom-5 fade-in-20">
      <div className="bg-rose-50/50 p-4 flex flex-row items-center justify-between border-b border-rose-100">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
             <MessageCircle className="h-5 w-5 text-rose-600" />
           </div>
           <div>
             <h3 className="text-base font-semibold text-slate-800">Health Assistant</h3>
             <p className="text-xs text-slate-500">Powered by Gemini</p>
           </div>
        </div>
        <div className="flex gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500" onClick={() => setIsOpen(false)}>
            <Minimize2 className="h-4 w-4" />
            <span className="sr-only">Minimize</span>
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-500 hover:text-red-500" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
            </button>
        </div>
      </div>
      
      <div className="flex-1 p-0 overflow-hidden bg-white/50">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-fit max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap break-words",
                  msg.role === 'user'
                    ? "ml-auto bg-rose-500 text-white rounded-br-none" 
                    : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                )}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white border border-slate-100 w-max rounded-2xl rounded-bl-none px-4 py-2.5 text-sm flex items-center gap-2 text-slate-500 shadow-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-3 bg-white border-t border-slate-100">
        <form 
          className="flex w-full items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        >
          <Input
            placeholder="Type your question..."
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" className="h-11 w-11 px-0" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}