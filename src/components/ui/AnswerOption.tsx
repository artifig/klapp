import React, { KeyboardEvent } from 'react';
import { RadioButton } from './RadioButton';

interface AnswerOptionProps {
  text: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  text,
  selected,
  onSelect,
  className = '',
  style
}) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <button 
      className={`answer-option ${selected ? 'selected' : ''} ${className}`}
      onClick={onSelect}
      onKeyPress={handleKeyPress}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={text}
      tabIndex={0}
      style={style}
    >
      <RadioButton 
        selected={selected} 
        aria-hidden="true"
      />
      <span className="answer-text">{text}</span>
    </button>
  );
}; 