'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, Center } from '@mantine/core';
import useAuth from '@/hooks/useAuth';

export default function RequireAuth({ children }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) router.replace('/login');
  }, [token, isLoading, router]);

  if (isLoading)
    return <Center h={400}><Loader /></Center>;
  if (!token) return null;

  return children;
}
