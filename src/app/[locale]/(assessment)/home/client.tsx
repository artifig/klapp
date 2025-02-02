'use client';

import { Interactive } from './components/interactive';
import { Context } from './components/context';

export function HomeClient() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Interactive />
      <Context />
    </div>
  );
} 