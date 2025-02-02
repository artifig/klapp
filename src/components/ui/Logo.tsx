'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="/logo.svg"
        alt="Logo"
        width={32}
        height={32}
        priority
      />
    </div>
  );
} 