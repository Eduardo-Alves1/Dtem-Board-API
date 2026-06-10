'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getStoredSession } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredSession() ? '/projects' : '/login');
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-muted">
      <div className="h-10 w-56 animate-pulse rounded-md bg-white" />
    </main>
  );
}
