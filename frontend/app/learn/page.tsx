"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { fetchArticles, refreshArticles, Article } from '@/lib/articles-api';
import Card from '@/components/ui/card';
import { Search, Bookmark, BookOpen, Clock, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

export default function LearnPage() {
  const { bookmarks, toggleBookmark } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // API State
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Symptoms', 'Nutrition', 'Essential'];

  // Fetch articles on mount and category change
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryParam = selectedCategory === 'All' ? undefined : selectedCategory;
        const data = await fetchArticles(categoryParam, 12);
        setArticles(data);
      } catch (err) {
        console.error("Failed to load articles", err);
        setError("Failed to load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [selectedCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshArticles();
      // Reload articles after refresh
      const categoryParam = selectedCategory === 'All' ? undefined : selectedCategory;
      const data = await fetchArticles(categoryParam, 12);
      setArticles(data);
    } catch (err) {
      console.error("Failed to refresh articles", err);
      // Could show a toast here
    } finally {
      setRefreshing(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getFallbackColor = (id: string) => {
    const colors = ['bg-rose-100', 'bg-orange-100', 'bg-indigo-100', 'bg-blue-100', 'bg-green-100'];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Library</h1>
        <p className="text-slate-600 mb-8">
          Trusted information to help you understand your body and navigate your journey with confidence.
        </p>
        
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search for symptoms, treatments, or topics..."
              className="pl-10 h-12 rounded-full shadow-sm border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="h-12 w-12 rounded-full p-0 flex items-center justify-center border-slate-200 shadow-sm"
            title="Refresh articles from source"
          >
            <RefreshCw className={cn("w-5 h-5 text-slate-600", refreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex justify-center gap-2 mb-12 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-slate-500">
          <p>{error}</p>
          <Button variant="ghost" onClick={() => setSelectedCategory(selectedCategory)}>Try Again</Button>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
           No articles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => {
            const isBookmarked = bookmarks.includes(article.id);
            const fallbackColor = getFallbackColor(article.id);
            
            return (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                key={article.id}
                className="block h-full"
              >
                <Card className="group h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-100">
                  <div className="h-48 relative overflow-hidden bg-slate-50">
                    {article.image_url ? (
                       <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback on error by hiding image and showing color
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add(fallbackColor);
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full ${fallbackColor}`} />
                    )}
                    
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
                        {article.category}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(article.id);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 transition-colors shadow-sm backdrop-blur-sm"
                    >
                      <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-rose-500 text-rose-500")} />
                    </button>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex gap-2 mb-3">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        #{article.source}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1">
                      {article.summary}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-50">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(article.published_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center font-medium text-rose-600 group-hover:translate-x-1 transition-transform">
                        Read Article
                        <BookOpen className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
