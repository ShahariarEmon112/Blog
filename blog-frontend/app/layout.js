import '@mantine/core/styles.css';
import { Inter } from 'next/font/google';
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const theme = createTheme({
  primaryColor: 'cyan',
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
});

export const metadata = {
  title: 'Blog Platform',
  description: 'A platform for young writers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className} style={{ minHeight: '100vh' }}>
        <NextTopLoader color="#06b6d4" showSpinner={false} />
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </ModalsProvider>
        </MantineProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
