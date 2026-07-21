import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from '@/providers/providers';

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
