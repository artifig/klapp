import React from 'react';
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
  return (
    <button 
      className={`answer-option ${selected ? 'selected' : ''} ${className}`}
      onClick={onSelect}
      type="button"
      style={style}
    >
      <RadioButton selected={selected} />
      <span className="answer-text">{text}</span>
    </button>
  );
}; 