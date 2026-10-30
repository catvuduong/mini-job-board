import { BadRequestException } from '@nestjs/common';

export type RawQuery = Record<string, string | string[] | undefined>;
export type JobSort = 'newest' | 'salary';

export interface JobFilters {
  q?: string;
  skills: string[];
  remote?: boolean;
  minSalary?: number;
  location?: string;
  sort: JobSort;
  page: number;
  pageSize: number;
}

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
const MAX_SKILL_FILTERS = 10;
const MAX_SEARCH_LENGTH = 100;

function single(query: RawQuery, key: string): string | undefined {
  const value = query[key];
  if (Array.isArray(value)) throw new BadRequestException(`${key} can only be given once`);
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function wholeNumber(query: RawQuery, key: string, min: number, max: number): number | undefined {
  const raw = single(query, key);
  if (raw === undefined) return undefined;
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || value < min || value > max) {
    throw new BadRequestException(`${key} must be an integer between ${min} and ${max}`);
  }
  return value;
}

export function parseJobFilters(query: RawQuery): JobFilters {
  const rawSkills = query.skill === undefined ? [] : [query.skill].flat();
  const skills = rawSkills.map((skill) => skill.trim()).filter((skill) => skill !== '');
  if (skills.length > MAX_SKILL_FILTERS) {
    throw new BadRequestException(`at most ${MAX_SKILL_FILTERS} skill filters are allowed`);
  }

  const remoteRaw = single(query, 'remote');
  if (remoteRaw !== undefined && remoteRaw !== 'true' && remoteRaw !== 'false') {
    throw new BadRequestException('remote must be true or false');
  }

  const sort = single(query, 'sort') ?? 'newest';
  if (sort !== 'newest' && sort !== 'salary') {
    throw new BadRequestException('sort must be newest or salary');
  }

  const q = single(query, 'q');
  const location = single(query, 'location');
  if ((q?.length ?? 0) > MAX_SEARCH_LENGTH || (location?.length ?? 0) > MAX_SEARCH_LENGTH) {
    throw new BadRequestException(`q and location must be at most ${MAX_SEARCH_LENGTH} characters`);
  }

  return {
    q,
    skills,
    remote: remoteRaw === undefined ? undefined : remoteRaw === 'true',
    minSalary: wholeNumber(query, 'minSalary', 0, 2_147_483_647),
    location,
    sort,
    page: wholeNumber(query, 'page', 1, 100_000) ?? 1,
    pageSize: wholeNumber(query, 'pageSize', 1, MAX_PAGE_SIZE) ?? DEFAULT_PAGE_SIZE,
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

// Builds the WHERE clause shared by the list and count queries. Skill filters require every selected skill.
export function buildJobWhere(filters: JobFilters): { where: string; params: unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];
  const ref = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (filters.q) {
    const term = ref(`%${escapeLike(filters.q)}%`);
    clauses.push(`(title ILIKE ${term} OR company ILIKE ${term} OR description ILIKE ${term})`);
  }
  if (filters.skills.length > 0) clauses.push(`skills @> ${ref(filters.skills)}::text[]`);
  if (filters.remote !== undefined) clauses.push(`remote = ${ref(filters.remote)}`);
  if (filters.minSalary !== undefined) clauses.push(`salary_max >= ${ref(filters.minSalary)}`);
  if (filters.location) clauses.push(`location ILIKE ${ref(`%${escapeLike(filters.location)}%`)}`);

  return { where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

export function jobOrderBy(sort: JobSort): string {
  return sort === 'salary' ? 'salary_max DESC, id DESC' : 'posted_at DESC, id DESC';
}
