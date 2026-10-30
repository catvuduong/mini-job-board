'use client';

import Link from 'next/link';
import { formatSalaryRange, formatUtcDate } from '@/lib/format';
import { useApi } from '@/lib/use-api';
import type { Job } from '@/lib/types';
import { ApplyForm } from './apply-form';
import { ErrorMessage } from './status';

export function JobDetail({ id }: { id: string }) {
  const job = useApi<Job>(`/jobs/${id}`);

  return (
    <main className="page">
      <Link href="/" className="back-link">
        ← All jobs
      </Link>

      {job.loading && !job.data && (
        <div className="skeleton skeleton-detail" role="status" aria-label="Loading job" />
      )}

      {job.error && !job.data && <ErrorMessage message={job.error} onRetry={job.reload} />}

      {job.data && <JobBody job={job.data} />}
    </main>
  );
}

function JobBody({ job }: { job: Job }) {
  return (
    <div className="detail-layout">
      <article className="detail" data-testid="job-detail">
        <header className="detail__header">
          <p className="eyebrow">{job.company}</p>
          <h1>{job.title}</h1>
          <p className="detail__meta">
            <span>{job.location}</span>
            {job.remote && <span className="badge badge--remote">Remote</span>}
            <span>{formatSalaryRange(job.salaryMin, job.salaryMax)}</span>
            <time dateTime={job.postedAt}>Posted {formatUtcDate(job.postedAt)}</time>
          </p>
        </header>

        <ul className="chips" aria-label="Skills">
          {job.skills.map((skill) => (
            <li key={skill} className="chip">
              {skill}
            </li>
          ))}
        </ul>

        <div className="detail__body">
          {job.description.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>

      <aside className="detail-aside">
        <ApplyForm jobId={job.id} jobTitle={job.title} />
      </aside>
    </div>
  );
}
