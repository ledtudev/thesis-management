'use client';

import { useRef, type ReactNode } from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Component giúp xử lý vấn đề với server components và hydration mismatches
 * khi sử dụng Zustand trong Next.js App Router
 */
export default function StoreProvider({ children }: StoreProviderProps) {
  const isHydrated = useRef(false);

  // On client-side, we mark the component as hydrated after first render
  if (typeof window !== 'undefined' && !isHydrated.current) {
    isHydrated.current = true;
  }

  // Skip rendering until hydration is complete to avoid hydration mismatch errors
  if (!isHydrated.current) {
    return null;
  }

  return <>{children}</>;
}
