'use client';

import {usePathname} from '@/navigation';
import {useTranslations} from 'next-intl';

const steps = [
  {id: 'home', path: '/'},
  {id: 'intro', path: '/intro'},
  {id: 'assessment', path: '/assessment'},
  {id: 'results', path: '/results'}
];

export function WorkflowProgress() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const currentStepIndex = steps.findIndex(step => 
    pathname === step.path || pathname.startsWith(step.path + '/')
  );

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-800 -z-10" />
        <div 
          className="absolute left-0 top-1/2 h-0.5 bg-orange-500 transition-all duration-500 -z-10"
          style={{width: `${(currentStepIndex / (steps.length - 1)) * 100}%`}}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div 
              key={step.id}
              className="flex flex-col items-center gap-2"
            >
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted ? 'bg-orange-500 text-white' : 
                    isCurrent ? 'bg-orange-500/20 text-orange-500 border-2 border-orange-500' : 
                    'bg-gray-800 text-gray-500'}
                `}
              >
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <span 
                className={`
                  text-sm font-medium hidden md:block
                  ${isCompleted ? 'text-orange-500' : 
                    isCurrent ? 'text-orange-500' : 
                    'text-gray-500'}
                `}
              >
                {t(step.id)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckIcon({className = ''}: {className?: string}) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={3}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
} 