import { stageMoveError } from './stages.js';

describe('stageMoveError', () => {
  it('allows forward moves, including skipping stages', () => {
    expect(stageMoveError('applied', 'screening')).toBeNull();
    expect(stageMoveError('applied', 'offer')).toBeNull();
    expect(stageMoveError('screening', 'interview')).toBeNull();
    expect(stageMoveError('interview', 'offer')).toBeNull();
  });

  it('allows rejecting from any open stage', () => {
    expect(stageMoveError('applied', 'rejected')).toBeNull();
    expect(stageMoveError('interview', 'rejected')).toBeNull();
    expect(stageMoveError('offer', 'rejected')).toBeNull();
  });

  it('refuses backward moves', () => {
    expect(stageMoveError('interview', 'screening')).toMatch(/only move forward/);
    expect(stageMoveError('offer', 'applied')).toMatch(/only move forward/);
  });

  it('refuses a move to the current stage', () => {
    expect(stageMoveError('screening', 'screening')).toMatch(/already in screening/);
  });

  it('refuses any move out of rejected', () => {
    expect(stageMoveError('rejected', 'applied')).toMatch(/cannot be moved/);
    expect(stageMoveError('rejected', 'interview')).toMatch(/cannot be moved/);
    expect(stageMoveError('rejected', 'rejected')).toMatch(/already in rejected/);
  });
});
