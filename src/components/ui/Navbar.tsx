'use client';

import {useTranslations} from 'next-intl';
import {usePathname, Link, routes} from '@/navigation';

export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();

  const steps = [
    {id: 'home', path: routes.home, label: t('nav.home')},
    {id: 'setup', path: routes.setup, label: t('nav.setup')},
    {id: 'assessment', path: routes.assessment, label: t('nav.assessment')},
    {id: 'results', path: routes.results, label: t('nav.results')},
  ];

  // Find the current step index
  const currentStepIndex = steps.findIndex(step => pathname === step.path);

  return (
    <nav className="w-full bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="grid grid-cols-4">
        {steps.map((step, index) => {
          const isActive = pathname === step.path;
          const isPast = index < currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <Link 
              href={step.path}
              key={step.id} 
              className={`relative flex flex-col items-center justify-center py-4 transition-all
                ${index !== steps.length - 1 ? 'border-r' : ''} border-gray-800
                ${isActive 
                  ? 'bg-orange-500/20' 
                  : isPast
                  ? 'bg-green-500/10 hover:bg-green-500/20'
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
                }
                ${isFuture ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
              `}
            >
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 