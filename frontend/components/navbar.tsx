"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { 
  LayoutDashboard, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  LogOut, 
  Menu, 
  X,
  PlusCircle,
  Users,
  Info
} from 'lucide-react';
import Button from './ui/button';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Trends', href: '/trends', icon: TrendingUp },
    { name: 'Learn', href: '/learn', icon: BookOpen },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'About', href: '/about', icon: Info },
  ];

  if (!isAuthenticated && pathname === '/') return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-600 hidden sm:block">
                Aletheia
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-rose-50 text-rose-600" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="h-6 w-px bg-slate-200 mx-2" />
              
              <Link href="/log">
                <Button size="sm" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Log Today
                </Button>
              </Link>

              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center text-rose-600 font-medium border border-rose-200">
                    {user?.name.charAt(0)}
                  </div>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          {isAuthenticated && (
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-lg text-base font-medium",
                    isActive 
                      ? "bg-rose-50 text-rose-600" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/log"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-rose-600 bg-rose-50"
            >
              <PlusCircle className="w-5 h-5 mr-3" />
              Log Today
            </Link>
            <div className="border-t border-slate-100 my-2 pt-2">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


