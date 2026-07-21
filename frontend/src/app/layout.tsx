import type { Metadata } from 'next';
import '../styles/globals.css';
import '../styles/utilities.css';
import { Providers } from '@/providers/providers';
import { GlobalLoader } from '@/components/shell';

export const metadata: Metadata = {
  title: {
    default: 'VoiceGateway – AI Voice Agent Platform',
    template: '%s | VoiceGateway',
  },
  description: 'Enterprise-grade AI Voice Agent SaaS Platform. Build, deploy, and monitor conversational AI agents.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <GlobalLoader />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
