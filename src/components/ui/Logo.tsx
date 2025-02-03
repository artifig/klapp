'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`h-8 w-[120px] relative ${className || ''}`}>
      <Image
        src="/Tehnopol_logo_RGB.png"
        alt="Logo"
        fill
        priority
        sizes="120px"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
} 