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
        sizes="(max-width: 768px) 120px, 120px"
        priority={false}
        loading="lazy"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
} 