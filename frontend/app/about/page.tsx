"use client";

import React from 'react';
import Card from '@/components/ui/card';
import { Shield, Heart, Brain, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white py-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Truth Revealed. Clarity Found.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Aletheia (pronounced: uh-LEE-thee-uh) comes from ancient Greek philosophy, meaning "truth revealed" or "uncovering what was hidden." We exist to bring this clarity to the menopause transition.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              For too long, perimenopause and menopause have been shrouded in silence, confusion, and dismissal. Women have been told to "just deal with it" or that their symptoms are "all in their head."
            </p>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              We believe that understanding your body is a fundamental right. Our mission is to provide women with empathetic, evidence-informed support to understand midlife hormonal changes, recognize patterns, and feel less alone.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 bg-rose-50 border-rose-100">
              <Heart className="w-8 h-8 text-rose-500 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Empathetic Support</h3>
              <p className="text-sm text-slate-600">Validating your lived experience without judgment.</p>
            </Card>
            <Card className="p-6 bg-purple-50 border-purple-100">
              <Brain className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Evidence-Based</h3>
              <p className="text-sm text-slate-600">Grounded in science, not pseudoscience.</p>
            </Card>
            <Card className="p-6 bg-orange-50 border-orange-100">
              <Shield className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Data Privacy</h3>
              <p className="text-sm text-slate-600">Your health data is yours, secure and private.</p>
            </Card>
            <Card className="p-6 bg-blue-50 border-blue-100">
              <Users className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Community</h3>
              <p className="text-sm text-slate-600">Connecting you with others on the same journey.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Our Core Values</h2>
          
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Calm & Validating</h3>
              <p className="text-slate-600">
                We reject alarmist language. We know that while symptoms can be challenging, this is a natural life transition, not a disease to be cured.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Clarity over Confusion</h3>
              <p className="text-slate-600">
                We help you connect the dots between symptoms, lifestyle, and hormonal changes, turning noise into signal.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Respect for Experience</h3>
              <p className="text-slate-600">
                We honor that every woman's experience is unique. There is no "one size fits all" approach to menopause.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
