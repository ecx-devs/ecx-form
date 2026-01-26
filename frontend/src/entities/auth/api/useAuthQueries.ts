'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from './authApi';
import { useAuthStore } from '../model/store';
import { LoginInput } from '../model/types';
import toast from 'react-hot-toast';

// Login mutation
export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data) => {
      setAuth(data.admin, data.token);
      toast.success('Welcome back!');
      router.push('/admin');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid email or password');
    },
  });
}

// Logout mutation
export function useLogout() {
  const router = useRouter();
  const { clearAuth, token } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      router.push('/login');
    },
    onError: () => {
      // Clear auth even on error
      clearAuth();
      router.push('/login');
    },
  });
}

// Verify session on app load
export function useVerifySession() {
  const { setAuth, clearAuth, setLoading, token } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      if (!token) {
        throw new Error('No token');
      }
      return authApi.verifySession();
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

