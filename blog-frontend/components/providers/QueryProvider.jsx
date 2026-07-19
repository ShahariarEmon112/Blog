'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function QueryProvider({ children }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    const handler = () => client.clear();
    window.addEventListener('clear-query-cache', handler);
    return () => window.removeEventListener('clear-query-cache', handler);
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
