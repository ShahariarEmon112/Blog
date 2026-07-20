'use client';

import { useQuery } from '@tanstack/react-query';
import { useSessionStorage } from '@mantine/hooks';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { axiosPrivate } from '@/utilities/axios';

export default function useAuth() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useSessionStorage({ key: 'token', defaultValue: null });
  const [isLoggedIn, setIsLoggedIn] = useSessionStorage({ key: 'isLoggedIn', defaultValue: false });

  useEffect(() => setHydrated(true), []);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['currentUser', token],
    queryFn: () => axiosPrivate.get('/auth/me').then(r => r.data),
    enabled: !!token && isLoggedIn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logout = useCallback(async () => {
    try { await axiosPrivate.post('/auth/logout'); } catch {}
    window.dispatchEvent(new Event('clear-query-cache'));
    setToken(null);
    setIsLoggedIn(false);
    router.push('/');
  }, [setToken, setIsLoggedIn, router]);

  return {
    user,
    token,
    hydrated,
    isLoggedIn: hydrated ? isLoggedIn : false,
    isLoading,
    isAdmin: !!user?.is_super_user,
    logout,
    refetch,
  };
}
