import { Suspense } from 'react';
import { JobDetail } from '@/components/job-detail';

// params is runtime data, so the read sits behind a Suspense boundary to let the route shell prerender.
export default function JobPage({ params }: PageProps<'/jobs/[id]'>) {
  return (
    <Suspense
      fallback={
        <div className="page">
          <div className="skeleton skeleton-detail" role="status" aria-label="Loading job" />
        </div>
      }
    >
      <JobPageContent params={params} />
    </Suspense>
  );
}

async function JobPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetail id={id} />;
}
