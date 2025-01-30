import React from 'react';

interface RadioButtonProps {
  selected: boolean;
  className?: string;
}

export const RadioButton: React.FC<RadioButtonProps> = ({ selected, className = '' }) => {
  return (
    <div 
      className={`relative w-5 h-5 rounded-full border-2 
        ${selected 
          ? 'border-orange-500 bg-orange-500/10' 
          : 'border-gray-600 bg-gray-800/50'} 
        transition-all duration-200 ${className}`}
    >
      {selected && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-2.5 h-2.5 rounded-full bg-orange-500 
            animate-scale-in"
        />
      )}
    </div>
  );
};

// Add this to your globals.css:
// @keyframes scaleIn {
//   from { transform: translate(-50%, -50%) scale(0); }
//   to { transform: translate(-50%, -50%) scale(1); }
// }
// .animate-scale-in {
//   animation: scaleIn 200ms ease-out forwards;
// } 