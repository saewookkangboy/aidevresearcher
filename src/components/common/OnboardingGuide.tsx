/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState, useEffect } from 'react';
import { X, Sparkles, Search, Target, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: <Sparkles className="w-6 h-6 text-primary-600" />,
    title: '역할을 선택하세요',
    description: '당신의 역할(프론트엔드, 백엔드, 디자이너 등)을 선택하면 맞춤 도구를 추천해드립니다.',
  },
  {
    icon: <Search className="w-6 h-6 text-primary-600" />,
    title: '원하는 것을 검색하세요',
    description: '예: "이미지 분석 봇 만들기", "Python AI 라이브러리" 등 자연스러운 문장으로 검색하세요.',
  },
  {
    icon: <Target className="w-6 h-6 text-primary-600" />,
    title: '목표를 입력하세요',
    description: '하고 싶은 일을 간단히 적으면 자동으로 필요한 도구를 찾아드립니다.',
  },
  {
    icon: <BookOpen className="w-6 h-6 text-primary-600" />,
    title: '도구를 확인하고 사용하세요',
    description: '추천된 도구의 설명과 사용 방법을 확인한 후, 명령어를 복사해서 바로 사용할 수 있습니다.',
  },
];

const STORAGE_KEY = 'vibe_coding_onboarding_completed';

interface OnboardingGuideProps {
  onClose?: () => void;
  forceOpen?: boolean;
}

export function OnboardingGuide({ onClose, forceOpen }: OnboardingGuideProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // 첫 방문 시 약간의 지연 후 표시
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    if (onClose) {
      onClose();
    }
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              {step.icon}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
            {step.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            {step.description}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index <= currentStep
                  ? 'bg-primary-600 w-8'
                  : 'bg-gray-200 dark:bg-gray-700 w-2'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            건너뛰기
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                시작하기
              </>
            ) : (
              <>
                다음
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

