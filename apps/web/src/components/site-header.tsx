'use client';

import Link from 'next/link';
import { useApi } from '@/lib/use-api';

interface Health {
  status: string;
  db: string;
}

export function SiteHeader() {
  const health = useApi<Health>('/health');
  const healthText = health.data
    ? `api ${health.data.status} / db ${health.data.db}`
    : health.error
      ? 'api unreachable'
      : 'checking...';

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            M
          </span>
          Mini Job Board
        </Link>
        <nav aria-label="Main" className="site-nav">
          <Link href="/">Jobs</Link>
          <Link href="/employer">Employer</Link>
        </nav>
        <p className="health" data-testid="health">
          {healthText}
        </p>
      </div>
    </header>
  );
}
