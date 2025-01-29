'use client';

import {useTranslations} from 'next-intl';
import {usePathname, Link, routes} from '@/navigation';
import {useAssessment} from '@/context/AssessmentContext';
import {Logo} from './Logo';
import {useLocale} from 'next-intl';

export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const {state} = useAssessment();
  const locale = useLocale();

  const steps = [
    {id: 'home', path: routes.home, label: t('nav.home')},
    {id: 'setup', path: routes.setup, label: t('nav.setup')},
    {id: 'assessment', path: routes.assessment, label: t('nav.assessment')},
    {id: 'results', path: routes.results, label: t('nav.results')},
  ];

  // Find the current step index
  const currentStepIndex = steps.findIndex(step => pathname === step.path);

  // Check if previous steps are completed
  const isStepAccessible = (index: number) => {
    if (index === 0) return true; // Home is always accessible
    
    // Check previous step requirements
    switch(index) {
      case 1: // Setup
        return state.goal.trim().length > 0; // Can only proceed if goal is set
      case 2: // Assessment
        return state.goal.trim().length > 0 && // Must have goal
               state.formData.name && 
               state.formData.company && 
               state.formData.email && 
               state.formData.companyType;
      case 3: // Results
        return state.goal.trim().length > 0 && // Must have goal
               state.formData.name && // Must have setup data
               state.formData.company && 
               state.formData.email && 
               state.formData.companyType &&
               Object.keys(state.answers).length === 2; // Must have all answers
      default:
        return false;
    }
  };

  return (
    <nav className="w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-[1fr_2fr_1fr] items-stretch h-[3.5rem] sm:h-16 relative">
        {/* Logo */}
        <Link 
          href={routes.home} 
          className="relative flex items-center justify-center border-r border-gray-800 transition-all bg-gray-800/50 hover:bg-gray-700/50"
        >
          <Logo className="h-8 sm:h-10 w-auto" />
        </Link>

        {/* Navigation Steps */}
        <div className="grid grid-cols-4 relative">
          {steps.map((step, index) => {
            const isActive = pathname === step.path;
            const isPast = index < currentStepIndex;
            const isFuture = index > currentStepIndex;
            const isAccessible = isStepAccessible(index);

            const StepContent = () => (
              <>
                {/* Step number circle or checkmark */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mb-1
                    ${isActive
                      ? 'bg-orange-500 text-white'
                      : isPast
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                    }`}
                >
                  {isPast ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-4 h-4"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`text-xs font-medium text-center
                    ${isActive
                      ? 'text-orange-500'
                      : isPast
                      ? 'text-green-500'
                      : 'text-gray-400'
                    }`}
                >
                  {step.label}
                </span>

                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />
                )}
              </>
            );

            return isAccessible ? (
              <Link 
                key={step.id}
                href={step.path}
                className={`relative flex flex-col items-center justify-center transition-all
                  ${index !== steps.length - 1 ? 'border-r' : ''} border-gray-800
                  ${isActive 
                    ? 'bg-orange-500/20' 
                    : isPast
                    ? 'bg-green-500/10 hover:bg-green-500/20'
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }
                  ${(!isAccessible || isFuture) ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
                `}
              >
                <StepContent />
              </Link>
            ) : (
              <div 
                key={step.id}
                className={`relative flex flex-col items-center justify-center transition-all
                  ${index !== steps.length - 1 ? 'border-r' : ''} border-gray-800
                  bg-gray-800/50
                  opacity-50 cursor-not-allowed
                `}
              >
                <StepContent />
              </div>
            );
          })}
        </div>

        {/* Language Switcher */}
        <Link
          href={pathname}
          locale={locale === 'en' ? 'et' : 'en'}
          className="relative flex items-center justify-center border-l border-gray-800 text-gray-400 hover:text-white transition-all bg-gray-800/50 hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm font-medium uppercase">{locale === 'en' ? 'ET' : 'EN'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
              <path fillRule="evenodd" d="M9 2.25a.75.75 0 01.75.75v1.506a49.38 49.38 0 015.343.371.75.75 0 11-.186 1.489c-.66-.083-1.323-.151-1.99-.206a18.67 18.67 0 01-2.969 6.323c.317.384.65.753.998 1.107a.75.75 0 11-1.07 1.052A18.902 18.902 0 019 13.687a18.823 18.823 0 01-5.656 4.482.75.75 0 11-.688-1.333 17.323 17.323 0 005.396-4.353A18.72 18.72 0 015.89 5.277C5.43 5.176 4.973 5.096 4.519 5.037A.75.75 0 114.706 3.55a37.647 37.647 0 014.544.428V3a.75.75 0 01.75-.75zm5.404 4.5a.75.75 0 01.904.563l2.25 8.5a.75.75 0 11-1.447.384l-2.25-8.5a.75.75 0 01.543-.947z" clipRule="evenodd" />
            </svg>
          </div>
        </Link>
      </div>
    </nav>
  );
} 