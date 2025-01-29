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
    <nav className="w-full bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50 px-2 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const isActive = pathname === step.path;
            const isPast = index < currentStepIndex;
            const isFuture = index > currentStepIndex;

            return (
              <div 
                key={step.id} 
                className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-orange-500/20 border-2 border-orange-500' 
                    : isPast
                    ? 'bg-green-500/10 border border-green-500'
                    : 'bg-gray-800/50 border border-gray-700'
                  }
                  ${isFuture ? 'opacity-50' : 'opacity-100'}
                `}
              >
                {/* Step number circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mb-1
                    ${isActive
                      ? 'bg-orange-500 text-white'
                      : isPast
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                    }`}
                >
                  {index + 1}
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

                {/* Progress line */}
                {index < steps.length - 1 && (
                  <div 
                    className={`hidden sm:block absolute h-[2px] top-1/2 -right-2 w-4 transform -translate-y-1/2
                      ${isPast ? 'bg-green-500' : 'bg-gray-700'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile view - single button for current step */}
        <div className="sm:hidden mt-2">
          {currentStepIndex >= 0 && (
            <div 
              className="flex items-center justify-center p-3 rounded-lg
                bg-orange-500/20 border-2 border-orange-500"
            >
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm mr-2">
                {currentStepIndex + 1}
              </div>
              <span className="text-orange-500 text-sm font-medium">
                {steps[currentStepIndex].label}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 