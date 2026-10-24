import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/site-header';
import { AnalyzeWorkspace } from './workspace';

export const metadata: Metadata = {
  title: 'New analysis',
};

export default function AnalyzePage() {
  return (
    <>
      <SiteHeader variant="app" />
      <AnalyzeWorkspace />
    </>
  );
}
