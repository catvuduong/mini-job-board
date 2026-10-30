import { formatSalary, STAGE_LABELS } from '@/lib/format';
import { STAGES, type Stats } from '@/lib/types';
import { ErrorMessage } from './status';

interface StatsStripProps {
  stats: Stats | undefined;
  loading: boolean;
  error: string | undefined;
  onRetry: () => void;
}

export function StatsStrip({ stats, loading, error, onRetry }: StatsStripProps) {
  if (!stats) {
    if (error) return <ErrorMessage message={`Could not load stats. ${error}`} onRetry={onRetry} />;
    return <div className="stats-strip stats-strip--loading" role="status" aria-label="Loading stats" aria-busy={loading} />;
  }

  const tiles = [
    { label: 'Open roles', value: stats.jobs.total },
    { label: 'Applications', value: stats.applications.total },
    ...STAGES.map((stage) => ({ label: STAGE_LABELS[stage], value: stats.applications.byStage[stage] })),
  ];

  return (
    <section className="stats-strip" aria-label="Pipeline statistics" data-testid="stats-strip" aria-busy={loading}>
      <ul className="stat-tiles">
        {tiles.map((tile) => (
          <li key={tile.label} className="stat-tile">
            <span className="stat-tile__value">{tile.value}</span>
            <span className="stat-tile__label">{tile.label}</span>
          </li>
        ))}
      </ul>
      {stats.topSkills.length > 0 && (
        <div className="stats-strip__skills">
          <span className="stats-strip__label">Average salary by skill</span>
          <ul className="chips">
            {stats.topSkills.map((skill) => (
              <li key={skill.skill} className="chip">
                {skill.skill} · {formatSalary(skill.averageSalary)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
