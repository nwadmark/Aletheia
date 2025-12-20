"use client";

import React, { useState } from 'react';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Calendar, MapPin, Video, Users, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'online' | 'in-person';
  location: string;
  description: string;
  attendees: number;
  image: string;
};

const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Menopause & Mental Health Workshop',
    date: 'Oct 24, 2023',
    time: '7:00 PM EST',
    type: 'online',
    location: 'Zoom',
    description: 'Join Dr. Sarah Miller for an open discussion about anxiety, mood swings, and emotional well-being during perimenopause.',
    attendees: 142,
    image: 'bg-rose-100'
  },
  {
    id: '2',
    title: 'Sunday Morning Yoga & Coffee',
    date: 'Oct 29, 2023',
    time: '10:00 AM',
    type: 'in-person',
    location: 'Central Park, NY',
    description: 'A gentle flow yoga session focused on cooling the body, followed by casual conversation and coffee.',
    attendees: 28,
    image: 'bg-green-100'
  },
  {
    id: '3',
    title: 'Nutrition for Hormonal Balance',
    date: 'Nov 2, 2023',
    time: '6:30 PM EST',
    type: 'online',
    location: 'Live Stream',
    description: 'Learn practical dietary changes to support your hormones with nutritionist Elena Rodriguez.',
    attendees: 89,
    image: 'bg-orange-100'
  },
  {
    id: '4',
    title: 'Local Support Circle: Chicago',
    date: 'Nov 5, 2023',
    time: '2:00 PM',
    type: 'in-person',
    location: 'The Community Hub, Chicago',
    description: 'A safe, private space to share experiences and connect with other women in your area.',
    attendees: 15,
    image: 'bg-purple-100'
  }
];

export default function CommunityPage() {
  const [filter, setFilter] = useState<'all' | 'online' | 'in-person'>('all');

  const filteredEvents = EVENTS.filter(event => 
    filter === 'all' ? true : event.type === filter
  );

  const handleJoin = (eventTitle: string) => {
    toast.success(`You've registered for "${eventTitle}"`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Community & Events</h1>
        <p className="text-slate-600 mb-8">
          Connect with others who understand. Join expert-led workshops or meetups to share, learn, and support each other.
        </p>

        <div className="inline-flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              filter === 'all' 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('online')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              filter === 'online' 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Online
          </button>
          <button
            onClick={() => setFilter('in-person')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              filter === 'in-person' 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            In-Person
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-slate-100">
            <div className="flex flex-col sm:flex-row h-full">
              {/* Date/Image Column */}
              <div className={cn("sm:w-48 p-6 flex flex-col items-center justify-center text-center shrink-0", event.image)}>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm mb-3 w-full max-w-[100px]">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {event.date.split(' ')[0]}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {event.date.split(' ')[1].replace(',', '')}
                  </p>
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/60 text-slate-800 backdrop-blur-sm">
                  {event.type === 'online' ? (
                    <Video className="w-3 h-3 mr-1" />
                  ) : (
                    <Users className="w-3 h-3 mr-1" />
                  )}
                  {event.type === 'online' ? 'Online' : 'In-Person'}
                </div>
              </div>

              {/* Content Column */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                  {event.title}
                </h3>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {event.location}
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-6 flex-1">
                  {event.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                  <div className="flex items-center text-xs text-slate-500">
                    <Users className="w-3 h-3 mr-1" />
                    {event.attendees} attending
                  </div>
                  <Button size="sm" onClick={() => handleJoin(event.title)}>
                    Join Event
                    <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
