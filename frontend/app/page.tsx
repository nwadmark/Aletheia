"use client";

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { ArrowRight, Activity, Calendar, BookOpen, Shield } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function LandingPage() {
  const { isAuthenticated } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] bg-orange-100/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium mb-6 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 mr-2"></span>
              Your Companion Through Change
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-2 leading-tight">
              Aletheia
            </h1>
            <p className="text-sm text-slate-400 font-medium mb-6 tracking-wide uppercase">
              (pronounced: uh-LEE-thee-uh)
            </p>
            
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Aletheia helps women uncover what’s really happening in their bodies and minds during perimenopause and menopause—turning confusion into clarity, and symptoms into understanding. You don't have to navigate this journey alone.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl shadow-xl shadow-rose-500/20">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl shadow-xl shadow-rose-500/20">
                      Start Your Journey
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl bg-white/80 backdrop-blur-sm">
                      Log In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="relative rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 p-4 shadow-2xl shadow-purple-500/10 transform rotate-x-12 perspective-1000">
              <div className="rounded-2xl overflow-hidden bg-white shadow-inner border border-slate-100 aspect-[16/9] flex items-center justify-center relative">
                {/* Abstract UI Representation */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div className="w-48 h-8 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-rose-100 rounded-full" />
                      <div className="w-8 h-8 bg-purple-100 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 h-full">
                    <div className="col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-4">
                      <div className="w-32 h-6 bg-slate-100 rounded-md" />
                      <div className="flex items-end gap-2 h-32">
                        {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                          <div key={i} className="flex-1 bg-rose-100 rounded-t-md relative overflow-hidden">
                            <div className="absolute bottom-0 w-full bg-rose-400 transition-all duration-1000" style={{ height: `${h}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-1 space-y-6">
                      <div className="bg-white rounded-xl shadow-sm p-6 h-32" />
                      <div className="bg-white rounded-xl shadow-sm p-6 h-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to take control</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for the perimenopause and menopause transition.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Symptom Tracking",
                desc: "Log symptoms in seconds. Track hot flushes, mood, sleep, and more with granular severity ratings.",
                color: "bg-rose-100 text-rose-600"
              },
              {
                icon: Calendar,
                title: "Pattern Recognition",
                desc: "Visualize your history with intuitive calendars and charts to identify triggers and trends over time.",
                color: "bg-purple-100 text-purple-600"
              },
              {
                icon: BookOpen,
                title: "Personalized Insights",
                desc: "Get educational content tailored to your specific stage and symptoms to help you understand your body.",
                color: "bg-orange-100 text-orange-600"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/50 to-purple-900/50" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to understand your body better?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of women who are navigating menopause with confidence using Aletheia.
          </p>
          {!isAuthenticated && (
            <Link href="/register">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 border-none text-lg px-10 py-6 rounded-2xl">
                Get Started for Free
              </Button>
            </Link>
          )}
          <p className="mt-6 text-sm text-slate-400 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Your data is private and secure
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-slate-900">Aletheia</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/about" className="hover:text-rose-600 transition-colors">About</Link>
            <Link href="/community" className="hover:text-rose-600 transition-colors">Community</Link>
            <span>© {new Date().getFullYear()} Aletheia. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
