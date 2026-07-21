'use client';

import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ReactQueryProvider } from '@/providers/query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delay={300}>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
