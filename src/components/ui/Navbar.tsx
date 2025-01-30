'use client';

import {useTranslations} from 'next-intl';
import {usePathname, Link, routes} from '@/navigation';
import {useAssessment} from '@/context/AssessmentContext';
import {Logo} from './Logo';
import {useLocale} from 'next-intl';
import { useSync } from '@/lib/sync';
import { SyncStatus } from './SyncStatus';
import useOfflineStatus from '@/hooks/useOfflineStatus';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const {state} = useAssessment();
  const locale = useLocale();
  const isOffline = useOfflineStatus();

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
        return Boolean(state.goal?.trim().length); // Can only proceed if goal is set
      case 2: // Assessment
        return Boolean(state.goal?.trim().length) && // Must have goal
               state.formData.name && 
               state.formData.company && 
               state.formData.email && 
               state.formData.companyType;
      case 3: // Results
        return Boolean(state.goal?.trim().length) && // Must have goal
               state.formData.name && // Must have setup data
               state.formData.company && 
               state.formData.email && 
               state.formData.companyType &&
               Object.keys(state.answers).length === 2; // Must have all answers
      default:
        return false;
    }
  };

  const { isOffline: syncIsOffline, syncStatus } = useSync<Record<string, never>>({
    key: 'global',
    initialData: {},
    onSync: async () => {
      // This is just a placeholder sync for global status
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  return (
    <nav className="w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-[1fr_2fr_auto] items-stretch h-[3.5rem] sm:h-16 relative">
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
            const isAccessible = isStepAccessible(index);
            const isCurrent = pathname === step.path;

            const StepContent = () => (
              <>
                {/* Step number circle or checkmark */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mb-1
                    ${isCurrent
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                    }`}
                >
                  {isCurrent ? (
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
                    ${isCurrent
                      ? 'text-orange-500'
                      : 'text-gray-400'
                    }`}
                >
                  {step.label}
                </span>

                {/* Active indicator line */}
                {isCurrent && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />
                )}
              </>
            );

            return isAccessible ? (
              <Link 
                key={step.id}
                href={step.path}
                className={`
                  flex items-center justify-center px-4 border-r border-gray-800
                  transition-all relative
                  ${isCurrent ? 'bg-gray-800/80 text-white' : ''}
                  ${isAccessible 
                    ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white cursor-pointer' 
                    : 'text-gray-600 cursor-not-allowed'}
                `}
              >
                <StepContent />
              </Link>
            ) : (
              <div 
                key={step.id}
                className={`
                  flex items-center justify-center px-4 border-r border-gray-800
                  transition-all relative
                  text-gray-600 cursor-not-allowed
                `}
              >
                <StepContent />
              </div>
            );
          })}
        </div>

        {/* Right Section: Language Switcher and Sync Status */}
        <div className="flex items-center px-4">
          {isOffline && (
            <span className="text-yellow-500 text-sm mr-4">
              {t('common.offline')}
            </span>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
} 