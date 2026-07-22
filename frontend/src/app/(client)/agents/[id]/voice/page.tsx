'use client';

import { Section, SectionHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Mic2 } from 'lucide-react';

export default function AgentVoicePage() {
  return (
    <Section>
      <SectionHeader title="Voice Configuration" description="Speech synthesis, recognition, and voice settings" />
      <EmptyState icon={Mic2} title="Voice not configured" description="Configure the voice, language, and speech settings for your agent." />
    </Section>
  );
}
