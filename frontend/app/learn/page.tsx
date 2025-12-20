"use client";

import React, { useState } from 'react';
import { useApp, ARTICLES } from '@/lib/store';
import Card from '@/components/ui/card';
import { Search, Bookmark, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Input from '@/components/ui/input';

export default function LearnPage() {
  const { bookmarks, toggleBookmark } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Symptoms', 'Nutrition', 'Essential'];

  const filteredArticles = ARTICLES.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Library</h1>
        <p className="text-slate-600 mb-8">
          Trusted information to help you understand your body and navigate your journey with confidence.
        </p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Search for symptoms, treatments, or topics..." 
            className="pl-10 h-12 rounded-full shadow-sm border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map((article) => {
          const isBookmarked = bookmarks.includes(article.id);
          
          return (
            <Card key={article.id} className="group h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-100">
              <div className={`h-48 ${article.image} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
                    {article.category}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleBookmark(article.id);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 transition-colors shadow-sm backdrop-blur-sm"
                >
                  <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-rose-500 text-rose-500")} />
                </button>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex gap-2 mb-3">
                  {article.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1">
                  {article.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-50">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {article.readTime} read
                  </div>
                  <div className="flex items-center font-medium text-rose-600 group-hover:translate-x-1 transition-transform">
                    Read Article
                    <BookOpen className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
