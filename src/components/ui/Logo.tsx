'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = '' }: LogoProps) => {
  return (
    <img
      src="/tehnopol-logo.svg"
      alt="Tehnopol Logo"
      className={className}
    />
  );
}; 