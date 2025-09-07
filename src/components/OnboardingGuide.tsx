"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, Zap, Users, DollarSign, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action?: {
    text: string;
    href: string;
  };
  completed?: boolean;
}

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export default function OnboardingGuide({ isOpen, onClose, userId }: OnboardingGuideProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Xeinst!",
      description: "You're about to join thousands of AI creators earning with their agents. Let's get you started in just 3 steps.",
      icon: Zap,
      completed: true
    },
    {
      id: "upload-agent",
      title: "Upload Your First Agent",
      description: "Connect your AI agent via webhook and make it available to users worldwide. You'll earn credits every time someone uses it.",
      icon: Upload,
      action: {
        text: "Upload Agent",
        href: "/upload-simple"
      }
    },
    {
      id: "earn-credits",
      title: "Start Earning Credits",
      description: "Once your agent is live, you'll earn credits every time someone uses it. Track your earnings in your dashboard.",
      icon: DollarSign,
      action: {
        text: "View Dashboard",
        href: "/dashboard"
      }
    },
    {
      id: "grow-audience",
      title: "Grow Your Audience",
      description: "Your agents are now discoverable by thousands of users. Share your agent links and watch your earnings grow!",
      icon: Users,
      action: {
        text: "Browse Marketplace",
        href: "/marketplace"
      }
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleAction = (step: OnboardingStep) => {
    if (step.action) {
      router.push(step.action.href);
      setCompletedSteps(prev => [...prev, step.id]);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-ai-primary/20 bg-background/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">Getting Started</CardTitle>
                  <CardDescription>Let's set up your account in just a few steps</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Current Step */}
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-ai flex items-center justify-center mb-6 mx-auto">
                    {React.createElement(steps[currentStep].icon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6">
                    {steps[currentStep].description}
                  </p>
                </motion.div>

                {/* Step Indicators */}
                <div className="flex justify-center space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-ai-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {steps[currentStep].action && (
                    <Button
                      onClick={() => handleAction(steps[currentStep])}
                      className="bg-gradient-ai hover:bg-gradient-ai/90 text-white"
                    >
                      {steps[currentStep].action?.text}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    variant="outline"
                    className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10"
                  >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next Step'}
                  </Button>
                </div>

                {/* Skip Option */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-muted-foreground hover:text-white"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
