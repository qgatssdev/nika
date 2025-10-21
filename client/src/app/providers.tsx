'use client';

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { is401Or403Error } from '../utils/helpers';

export default function Providers({ children }: { children: ReactNode }) {
  const { refresh } = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            if (is401Or403Error(error)) {
              Cookies.remove('authSession');
              refresh();
            }
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position='top-center'
        containerStyle={{ zIndex: 100000 }}
        toastOptions={{
          duration: 2000,
          style: {},
          success: {
            duration: 2000,
          },
          error: {
            duration: 2000,
          },
        }}
      />
      {children}
    </QueryClientProvider>
  );
}
