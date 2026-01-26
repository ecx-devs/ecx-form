'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/entities/auth';
import { Spinner } from '@/shared/ui';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, token, setLoading } = useAuthStore();

  useEffect(() => {
    // Check if we have a token in storage on initial load
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      try {
        const stored = localStorage.getItem('ecx-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.state?.token && parsed.state?.isAuthenticated) {
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore parsing errors
      }

      setLoading(false);
      
      // Redirect to login if not authenticated and on admin route
      if (pathname.startsWith('/admin')) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, router, setLoading]);

  useEffect(() => {
    // Redirect to login if not authenticated on admin routes
    if (!isLoading && !isAuthenticated && pathname.startsWith('/admin')) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading while checking auth
  if (isLoading && pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // If on admin route and not authenticated, don't render children
  if (!isAuthenticated && pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}

