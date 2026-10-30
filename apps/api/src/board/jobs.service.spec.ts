import { BadRequestException } from '@nestjs/common';
import { parseJobInput } from './jobs.service.js';

const validJob = {
  title: '  Data Engineer ',
  company: 'Acme',
  location: 'Lisbon',
  salaryMin: 60000,
  salaryMax: 80000,
  skills: ['SQL', 'SQL', 'Python'],
  description: 'Build pipelines.',
};

describe('parseJobInput', () => {
  it('trims text, removes duplicate skills and defaults remote to false', () => {
    expect(parseJobInput(validJob)).toEqual({
      title: 'Data Engineer',
      company: 'Acme',
      location: 'Lisbon',
      remote: false,
      salaryMin: 60000,
      salaryMax: 80000,
      skills: ['SQL', 'Python'],
      description: 'Build pipelines.',
    });
  });

  it.each([
    [{ salaryMin: 90000 }, /salaryMax must be at least salaryMin/],
    [{ remote: 'yes' }, /remote must be a boolean/],
    [{ skills: [] }, /skills must have between 1 and 15 entries/],
    [{ title: '   ' }, /title is required/],
    [{ salaryMin: 1.5 }, /salaryMin must be an integer/],
  ])('rejects %j', (override, message) => {
    expect(() => parseJobInput({ ...validJob, ...override })).toThrow(BadRequestException);
    expect(() => parseJobInput({ ...validJob, ...override })).toThrow(message);
  });

  it('rejects a body that is not an object', () => {
    expect(() => parseJobInput(['job'])).toThrow(/request body must be a JSON object/);
  });
});
