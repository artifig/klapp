'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({className = ''}: LogoProps) {
  return (
    <Image
      src="/Tehnopol_logo_RGB.png"
      alt="Tehnopol"
      width={120}
      height={40}
      style={{ objectFit: 'contain' }}
      className={`opacity-80 hover:opacity-100 transition-opacity ${className}`}
    />
  );
} 