import type { Stage } from './board.types.js';

// Forward order of the pipeline. 'rejected' is not part of the order: it can be reached from any open stage.
const PIPELINE: Exclude<Stage, 'rejected'>[] = ['applied', 'screening', 'interview', 'offer'];

// Returns why a move is not allowed, or null when it is.
export function stageMoveError(from: Stage, to: Stage): string | null {
  if (from === to) return `application is already in ${to}`;
  if (from === 'rejected') return 'rejected applications cannot be moved';
  if (to === 'rejected') return null;
  if (PIPELINE.indexOf(to) > PIPELINE.indexOf(from)) return null;
  return `stages only move forward: cannot move from ${from} back to ${to}`;
}
