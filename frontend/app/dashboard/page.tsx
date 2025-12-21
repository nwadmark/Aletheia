"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { fetchArticles, Article } from '@/lib/articles-api';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Calendar, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user, logs, isAuthenticated, isLoading } = useApp();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const data = await fetchArticles(undefined, 2);
        setArticles(data);
      } catch (error) {
        console.error("Failed to load articles", error);
      } finally {
        setArticlesLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadArticles();
    }
  }, [isAuthenticated]);

  const getFallbackColor = (id: string) => {
    const colors = ['bg-rose-100', 'bg-orange-100', 'bg-indigo-100', 'bg-blue-100', 'bg-green-100'];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && user && !user.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !user) return null;

  const today = new Date().toISOString().split('T')[0];
  const hasLoggedToday = logs.some(log => log.date === today);
  const recentLogs = logs.slice(-5).reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user.name.split(' ')[0]}
        </h1>
        <p className="text-slate-600 mt-1">Here&apos;s what&apos;s happening with your health today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Action Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Status Card */}
          <Card className="p-8 bg-gradient-to-br from-rose-500 to-purple-600 text-white border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">
                {hasLoggedToday ? "You're all caught up!" : "How are you feeling today?"}
              </h2>
              <p className="text-rose-100 mb-6 max-w-md">
                {hasLoggedToday 
                  ? "Great job tracking your symptoms. Consistent logging helps identify patterns over time."
                  : "Take a moment to log your symptoms. It only takes 2 minutes and helps you understand your body better."}
              </p>
              
              {hasLoggedToday ? (
                <Link href="/calendar">
                  <Button variant="secondary" className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm">
                    View Calendar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/log">
                  <Button variant="secondary" size="lg" className="bg-white text-rose-600 hover:bg-rose-50 border-none shadow-lg">
                    <PlusCircle className="mr-2 w-5 h-5" />
                    Log Symptoms
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
              <Link href="/calendar" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                View all
              </Link>
            </div>
            
            {recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <Card key={log.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
                        {new Date(log.date).getDate()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{formatDate(new Date(log.date))}</p>
                        <p className="text-sm text-slate-500">{log.symptoms.length} symptoms logged</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {log.symptoms.slice(0, 3).map((s, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {s.name}
                        </span>
                      ))}
                      {log.symptoms.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          +{log.symptoms.length - 3}
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-slate-500 bg-slate-50 border-dashed">
                <p>No logs yet. Start tracking to see your history here.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-purple-50 border-purple-100">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3 text-purple-600">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
              <p className="text-xs text-slate-500 font-medium">Total Logs</p>
            </Card>
            <Card className="p-4 bg-orange-50 border-orange-100">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3 text-orange-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + log.symptoms.length, 0) / logs.length) : 0}
              </p>
              <p className="text-xs text-slate-500 font-medium">Avg Symptoms/Day</p>
            </Card>
          </div>

          {/* Recommended Reading */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recommended for You</h3>
              <Link href="/learn" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                Library
              </Link>
            </div>
            <div className="space-y-4">
              {articlesLoading ? (
                <>
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </>
              ) : articles.length > 0 ? (
                articles.map((article) => {
                  const fallbackColor = getFallbackColor(article.id);
                  return (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Card className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 group h-full">
                        <div className={`h-24 relative ${!article.image_url ? fallbackColor : 'bg-slate-100'}`}>
                          {article.image_url ? (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add(fallbackColor);
                              }}
                            />
                          ) : null}
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
                              {article.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-slate-900 mb-1 group-hover:text-rose-600 transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          <div className="flex items-center text-xs text-slate-500 mt-2">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(article.published_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Card>
                    </a>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p>No recommendations yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

