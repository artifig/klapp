import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export const Card = ({ children, title, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && (
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
};

export default Card; 