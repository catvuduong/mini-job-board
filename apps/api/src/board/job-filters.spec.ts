import { BadRequestException } from '@nestjs/common';
import { buildJobWhere, DEFAULT_PAGE_SIZE, jobOrderBy, parseJobFilters } from './job-filters.js';

describe('parseJobFilters', () => {
  it('uses newest-first, page 1, and the default page size when nothing is given', () => {
    expect(parseJobFilters({})).toEqual({
      q: undefined,
      skills: [],
      remote: undefined,
      minSalary: undefined,
      location: undefined,
      sort: 'newest',
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  });

  it('accepts a repeated skill parameter and trims values', () => {
    expect(parseJobFilters({ skill: [' TypeScript ', 'SQL', ' '] }).skills).toEqual([
      'TypeScript',
      'SQL',
    ]);
    expect(parseJobFilters({ skill: 'Go' }).skills).toEqual(['Go']);
  });

  it('parses remote, minSalary, location and sort', () => {
    const filters = parseJobFilters({
      remote: 'false',
      minSalary: '90000',
      location: ' Berlin ',
      sort: 'salary',
    });
    expect(filters).toMatchObject({
      remote: false,
      minSalary: 90000,
      location: 'Berlin',
      sort: 'salary',
    });
  });

  it.each([
    [{ remote: 'yes' }, /remote must be true or false/],
    [{ sort: 'price' }, /sort must be newest or salary/],
    [{ minSalary: '-1' }, /minSalary must be an integer/],
    [{ minSalary: '12.5' }, /minSalary must be an integer/],
    [{ page: '0' }, /page must be an integer/],
    [{ pageSize: '500' }, /pageSize must be an integer/],
    [{ q: ['a', 'b'] }, /q can only be given once/],
    [{ skill: Array.from({ length: 11 }, (_, i) => `s${i}`) }, /at most 10 skill filters/],
  ])('rejects invalid query %j', (query, message) => {
    expect(() => parseJobFilters(query as Record<string, string | string[]>)).toThrow(
      BadRequestException,
    );
    expect(() => parseJobFilters(query as Record<string, string | string[]>)).toThrow(message);
  });
});

describe('buildJobWhere', () => {
  it('returns no clause when there are no filters', () => {
    expect(buildJobWhere(parseJobFilters({}))).toEqual({ where: '', params: [] });
  });

  it('combines every filter with AND and numbers the parameters in order', () => {
    const { where, params } = buildJobWhere(
      parseJobFilters({
        q: 'engineer',
        skill: ['TypeScript', 'PostgreSQL'],
        remote: 'true',
        minSalary: '100000',
        location: 'Remote',
      }),
    );
    expect(where).toBe(
      'WHERE (title ILIKE $1 OR company ILIKE $1 OR description ILIKE $1) AND skills @> $2::text[] AND remote = $3 AND salary_max >= $4 AND location ILIKE $5',
    );
    expect(params).toEqual(['%engineer%', ['TypeScript', 'PostgreSQL'], true, 100000, '%Remote%']);
  });

  it('escapes LIKE wildcards in free text', () => {
    const { params } = buildJobWhere(parseJobFilters({ q: '100%_done\\' }));
    expect(params).toEqual(['%100\\%\\_done\\\\%']);
  });
});

describe('jobOrderBy', () => {
  it('sorts newest by posted date and salary by the top of the range', () => {
    expect(jobOrderBy('newest')).toBe('posted_at DESC, id DESC');
    expect(jobOrderBy('salary')).toBe('salary_max DESC, id DESC');
  });
});
