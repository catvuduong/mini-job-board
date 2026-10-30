import type { Metadata } from 'next';
import { PipelineBoard } from '@/components/pipeline-board';

export const metadata: Metadata = {
  title: 'Hiring pipeline | Mini Job Board',
};

export default function EmployerPage() {
  return <PipelineBoard />;
}
