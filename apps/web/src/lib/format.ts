import { STAGES, type Stage } from './types';

export const STAGE_LABELS: Record<Stage, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

// Stages a candidate can move to from here. Mirrors the API rules in apps/api/src/board/stages.ts.
export function allowedMoves(from: Stage): Stage[] {
  if (from === 'rejected') return [];
  const pipeline = STAGES.filter((stage) => stage !== 'rejected');
  return [...pipeline.slice(pipeline.indexOf(from) + 1), 'rejected'];
}

export function formatSalaryRange(min: number, max: number): string {
  return `${formatSalary(min)} – ${formatSalary(max)}`;
}

export function formatSalary(amount: number): string {
  return `$${Math.round(amount / 1000)}k`;
}

// Dates are shown in UTC so every visitor sees the same day.
export function formatUtcDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
