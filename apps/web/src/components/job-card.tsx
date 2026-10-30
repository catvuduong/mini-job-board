import Link from 'next/link';
import { formatSalaryRange, formatUtcDate } from '@/lib/format';
import type { Job } from '@/lib/types';

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="job-card" data-testid="job-card">
      <div className="job-card__top">
        <div>
          <h2 className="job-card__title">{job.title}</h2>
          <p className="job-card__company">{job.company}</p>
        </div>
        {job.remote && <span className="badge badge--remote">Remote</span>}
      </div>
      <p className="job-card__meta">
        {job.location} · {formatSalaryRange(job.salaryMin, job.salaryMax)}
      </p>
      <ul className="chips" aria-label="Skills">
        {job.skills.map((skill) => (
          <li key={skill} className="chip">
            {skill}
          </li>
        ))}
      </ul>
      <p className="job-card__description">{job.description}</p>
      <time className="job-card__posted" dateTime={job.postedAt}>
        Posted {formatUtcDate(job.postedAt)}
      </time>
    </Link>
  );
}
