"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, SYMPTOMS_LIST } from '@/lib/store';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = [
  {
    id: 'age',
    title: 'Tell us about yourself',
    description: 'This helps us personalize your experience.',
    question: 'What is your age range?',
    options: ['Under 40', '40-45', '46-50', '51-55', '55+']
  },
  {
    id: 'status',
    title: 'Where are you in your journey?',
    description: 'Understanding your stage helps us provide relevant insights.',
    question: 'Which best describes your menstrual status?',
    options: [
      'Regular periods',
      'Irregular periods (Perimenopause)',
      'No period for 12+ months (Post-menopause)',
      'Surgical menopause',
      'Unsure'
    ]
  },
  {
    id: 'symptoms',
    title: 'What brings you here?',
    description: 'Select the symptoms that bother you the most (up to 3).',
    question: 'Primary symptoms:',
    options: SYMPTOMS_LIST,
    multiSelect: true
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{
    ageRange: string;
    menstrualStatus: string;
    primarySymptoms: string[];
  }>({
    ageRange: '',
    menstrualStatus: '',
    primarySymptoms: []
  });

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleOptionSelect = (option: string) => {
    if (step.multiSelect) {
      const current = answers.primarySymptoms;
      if (current.includes(option)) {
        setAnswers({ ...answers, primarySymptoms: current.filter((i: string) => i !== option) });
      } else {
        if (current.length >= 3) {
          toast.error('Please select up to 3 symptoms');
          return;
        }
        setAnswers({ ...answers, primarySymptoms: [...current, option] });
      }
    } else {
      const key = step.id === 'age' ? 'ageRange' : 'menstrualStatus';
      setAnswers({ ...answers, [key]: option });
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      try {
        await completeOnboarding(answers);
        toast.success("Profile setup complete!");
        router.push('/dashboard');
      } catch (error) {
        console.error("Onboarding error:", error);
        toast.error("Failed to save profile. Please try again.");
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const canProceed = () => {
    if (step.id === 'age') return !!answers.ageRange;
    if (step.id === 'status') return !!answers.menstrualStatus;
    if (step.id === 'symptoms') return answers.primarySymptoms.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-slate-500 text-right">
            Step {currentStep + 1} of {STEPS.length}
          </div>
        </div>

        <Card className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{step.title}</h1>
            <p className="text-slate-600 text-lg">{step.description}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-slate-900 mb-4">{step.question}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {step.options.map((option) => {
                const isSelected = step.multiSelect 
                  ? answers.primarySymptoms.includes(option)
                  : (step.id === 'age' ? answers.ageRange === option : answers.menstrualStatus === option);

                return (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group",
                      isSelected 
                        ? "border-rose-500 bg-rose-50 text-rose-900" 
                        : "border-slate-100 bg-white hover:border-rose-200 hover:bg-slate-50"
                    )}
                  >
                    <span className="font-medium">{option}</span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && "invisible")}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8"
            >
              {isLastStep ? 'Complete Setup' : 'Next Step'}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}


