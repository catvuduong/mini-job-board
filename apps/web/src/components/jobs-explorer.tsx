'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/lib/use-api';
import type { JobPage, SkillCount } from '@/lib/types';
import { EmptyState, ErrorMessage, LoadingCards } from './status';
import { JobCard } from './job-card';
import { JobFilters } from './job-filters';

const PAGE_SIZE = 12;

type Sort = 'newest' | 'salary';

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function JobsExplorer() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minSalary, setMinSalary] = useState(0);
  const [sort, setSort] = useState<Sort>('newest');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounced(search.trim(), 300);
  const debouncedLocation = useDebounced(location.trim(), 300);

  const params = new URLSearchParams();
  if (debouncedSearch) params.set('q', debouncedSearch);
  if (debouncedLocation) params.set('location', debouncedLocation);
  for (const skill of skills) params.append('skill', skill);
  if (remoteOnly) params.set('remote', 'true');
  if (minSalary > 0) params.set('minSalary', String(minSalary));
  params.set('sort', sort);
  params.set('page', String(page));
  params.set('pageSize', String(PAGE_SIZE));

  const jobs = useApi<JobPage>(`/jobs?${params}`);
  const skillList = useApi<SkillCount[]>('/jobs/skills');

  const activeCount =
    skills.length + (remoteOnly ? 1 : 0) + (minSalary > 0 ? 1 : 0) + (location ? 1 : 0) + (search ? 1 : 0);

  // Every filter change returns to the first page, so the page never points past the end of the results.
  function changeFilter<T>(set: (value: T) => void, value: T) {
    set(value);
    setPage(1);
  }

  function toggleSkill(name: string) {
    setPage(1);
    setSkills((current) =>
      current.includes(name) ? current.filter((skill) => skill !== name) : [...current, name],
    );
  }

  function clearAll() {
    setSearch('');
    setLocation('');
    setSkills([]);
    setRemoteOnly(false);
    setMinSalary(0);
    setPage(1);
  }

  const data = jobs.data;
  const totalPages = data?.totalPages ?? 1;

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Open roles</p>
          <h1>Find your next role</h1>
          <p className="hero__lede">
            {data ? `${data.total} roles` : 'Roles'} from teams hiring now. Filter by skill, salary or
            location to narrow the list.
          </p>
        </div>
        <label className="search">
          <span className="sr-only">Search jobs</span>
          <input
            type="search"
            className="input input--search"
            placeholder="Search title, company or keyword"
            value={search}
            data-testid="search-input"
            onChange={(e) => changeFilter(setSearch, e.target.value)}
          />
        </label>
      </section>

      <div className="jobs-layout">
        <JobFilters
          skills={skillList.data}
          skillsError={skillList.error}
          selectedSkills={skills}
          onToggleSkill={toggleSkill}
          remoteOnly={remoteOnly}
          onRemoteOnlyChange={(value) => changeFilter(setRemoteOnly, value)}
          minSalary={minSalary}
          onMinSalaryChange={(value) => changeFilter(setMinSalary, value)}
          location={location}
          onLocationChange={(value) => changeFilter(setLocation, value)}
          activeCount={activeCount}
          onClear={clearAll}
        />

        <section className="results" aria-labelledby="results-heading">
          <div className="results__toolbar">
            <h2 id="results-heading" className="sr-only">
              Job results
            </h2>
            <p className="results__count" data-testid="result-count" aria-live="polite">
              {data ? `Showing ${data.items.length} of ${data.total} jobs` : 'Loading jobs...'}
            </p>
            <label className="sort">
              <span>Sort by</span>
              <select
                className="input input--select"
                value={sort}
                data-testid="sort-select"
                onChange={(e) => {
                  setSort(e.target.value as Sort);
                  setPage(1);
                }}
              >
                <option value="newest">Newest</option>
                <option value="salary">Highest salary</option>
              </select>
            </label>
          </div>

          {jobs.loading && !data && <LoadingCards count={6} label="Loading jobs" />}

          {jobs.error && !data && <ErrorMessage message={`Could not load jobs. ${jobs.error}`} onRetry={jobs.reload} />}

          {data && data.items.length === 0 && (
            <EmptyState>
              <p>No jobs match these filters.</p>
              <button type="button" className="button button--secondary" onClick={clearAll}>
                Clear filters
              </button>
            </EmptyState>
          )}

          {data && data.items.length > 0 && (
            <div className="card-grid" aria-busy={jobs.loading} data-testid="job-list">
              {data.items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {data && totalPages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button
                type="button"
                className="button button--secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>
                Page {data.page} of {data.totalPages}
              </span>
              <button
                type="button"
                className="button button--secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
