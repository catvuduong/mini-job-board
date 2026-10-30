'use client';

import { useEffect, useRef, useState } from 'react';
import { patchJson } from '@/lib/api';
import { allowedMoves, formatUtcDate, STAGE_LABELS } from '@/lib/format';
import { useApi } from '@/lib/use-api';
import { STAGES, type Application, type Stage, type Stats } from '@/lib/types';
import { ErrorMessage, LoadingCards } from './status';
import { StatsStrip } from './stats-strip';

export function PipelineBoard() {
  const applications = useApi<Application[]>('/applications');
  const stats = useApi<Stats>('/stats');
  const [moving, setMoving] = useState<ReadonlySet<number>>(new Set());
  const [errors, setErrors] = useState<Record<number, string>>({});
  // After a move the card is re-rendered in another column, which would drop keyboard focus. Restore it.
  const focusAfterMove = useRef<number | null>(null);

  useEffect(() => {
    if (focusAfterMove.current === null) return;
    document.querySelector<HTMLElement>(`[data-application-id="${focusAfterMove.current}"]`)?.focus();
    focusAfterMove.current = null;
  }, [applications.data]);

  async function move(application: Application, to: Stage) {
    setMoving((current) => new Set(current).add(application.id));
    setErrors((current) => {
      const next = { ...current };
      delete next[application.id];
      return next;
    });
    try {
      const updated = await patchJson<Application>(`/applications/${application.id}/stage`, { stage: to });
      focusAfterMove.current = updated.id;
      applications.mutate((list) => list.map((item) => (item.id === updated.id ? updated : item)));
      stats.reload();
    } catch (err) {
      setErrors((current) => ({
        ...current,
        [application.id]: err instanceof Error ? err.message : 'Could not move this application.',
      }));
      // The board may be out of date (for example, another user moved the card first). Reload it.
      applications.reload();
    } finally {
      setMoving((current) => {
        const next = new Set(current);
        next.delete(application.id);
        return next;
      });
    }
  }

  const list = applications.data ?? [];

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Employer</p>
        <h1>Hiring pipeline</h1>
        <p className="page-header__lede">
          Candidates move left to right. Use the buttons on a card to advance it or reject it.
        </p>
      </header>

      <StatsStrip
        stats={stats.data}
        loading={stats.loading}
        error={stats.error}
        onRetry={stats.reload}
      />

      {applications.loading && !applications.data && <LoadingCards count={5} label="Loading pipeline" />}

      {applications.error && !applications.data && (
        <ErrorMessage message={`Could not load applications. ${applications.error}`} onRetry={applications.reload} />
      )}

      {applications.data && (
        <div className="board" role="region" aria-label="Application pipeline" tabIndex={0}>
          {STAGES.map((stage) => {
            const cards = list.filter((application) => application.stage === stage);
            return (
              <section
                key={stage}
                className={`column column--${stage}`}
                data-testid={`pipeline-column-${stage}`}
                aria-labelledby={`column-${stage}`}
              >
                <header className="column__header">
                  <h2 id={`column-${stage}`}>{STAGE_LABELS[stage]}</h2>
                  <span className="count" aria-label={`${cards.length} candidates`}>
                    {cards.length}
                  </span>
                </header>
                {cards.length === 0 ? (
                  <p className="column__empty">No candidates</p>
                ) : (
                  <ul className="column__list">
                    {cards.map((application) => (
                      <li key={application.id}>
                        <ApplicationCard
                          application={application}
                          busy={moving.has(application.id)}
                          error={errors[application.id]}
                          onMove={(to) => move(application, to)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

interface ApplicationCardProps {
  application: Application;
  busy: boolean;
  error: string | undefined;
  onMove: (to: Stage) => void;
}

function ApplicationCard({ application, busy, error, onMove }: ApplicationCardProps) {
  const nameId = `application-${application.id}-name`;
  const moves = allowedMoves(application.stage);

  return (
    <article
      className="app-card"
      data-testid="application-card"
      data-application-id={application.id}
      tabIndex={-1}
      aria-labelledby={nameId}
      aria-busy={busy}
    >
      <h3 id={nameId} className="app-card__name">
        {application.candidateName}
      </h3>
      <p className="app-card__email">{application.candidateEmail}</p>
      <p className="app-card__job">
        {application.jobTitle} · {application.company}
      </p>
      {application.note && <p className="app-card__note">{application.note}</p>}
      <p className="app-card__meta">
        Updated <time dateTime={application.updatedAt}>{formatUtcDate(application.updatedAt)}</time>
      </p>

      {moves.length > 0 && (
        <div className="app-card__actions" role="group" aria-labelledby={nameId}>
          {moves.map((to) => (
            <button
              key={to}
              type="button"
              className={`button button--small ${to === 'rejected' ? 'button--danger' : 'button--secondary'}`}
              data-testid={`move-${to}`}
              disabled={busy}
              onClick={() => onMove(to)}
            >
              {to === 'rejected' ? 'Reject' : `Move to ${STAGE_LABELS[to].toLowerCase()}`}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="notice notice--error" data-testid="stage-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
