import type { Metadata } from 'next';
import { JobsExplorer } from '@/components/jobs-explorer';

export const metadata: Metadata = {
  title: 'Jobs | Mini Job Board',
};

export default function JobsPage() {
  return <JobsExplorer />;
}
