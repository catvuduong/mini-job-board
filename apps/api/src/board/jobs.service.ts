import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db.service.js';
import type { Job } from './board.types.js';
import { buildJobWhere, jobOrderBy, type JobFilters } from './job-filters.js';
import { parseBody, parseInteger, parseText } from './validation.js';

export interface JobPage {
  items: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SkillCount {
  name: string;
  count: number;
}

const JOB_COLUMNS = `id, title, company, location, remote,
  salary_min AS "salaryMin", salary_max AS "salaryMax", skills, description, posted_at AS "postedAt"`;

@Injectable()
export class JobsService {
  constructor(private readonly db: DbService) {}

  async listJobs(filters: JobFilters): Promise<JobPage> {
    const { where, params } = buildJobWhere(filters);
    const [count] = await this.db.query<{ total: number }>(
      `SELECT count(*)::int AS total FROM jobs ${where}`,
      params,
    );
    const items = await this.db.query<Job>(
      `SELECT ${JOB_COLUMNS} FROM jobs ${where} ORDER BY ${jobOrderBy(filters.sort)}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, filters.pageSize, (filters.page - 1) * filters.pageSize],
    );
    return {
      items,
      total: count.total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.max(1, Math.ceil(count.total / filters.pageSize)),
    };
  }

  async getJob(id: number): Promise<Job> {
    const [job] = await this.db.query<Job>(`SELECT ${JOB_COLUMNS} FROM jobs WHERE id = $1`, [id]);
    if (!job) throw new NotFoundException(`job ${id} not found`);
    return job;
  }

  async createJob(body: unknown): Promise<Job> {
    const input = parseJobInput(body);
    const [job] = await this.db.query<Job>(
      `INSERT INTO jobs (title, company, location, remote, salary_min, salary_max, skills, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${JOB_COLUMNS}`,
      [
        input.title,
        input.company,
        input.location,
        input.remote,
        input.salaryMin,
        input.salaryMax,
        input.skills,
        input.description,
      ],
    );
    return job;
  }

  listSkills(): Promise<SkillCount[]> {
    return this.db.query<SkillCount>(
      `SELECT skill AS name, count(*)::int AS count
       FROM jobs CROSS JOIN LATERAL unnest(jobs.skills) AS s(skill)
       GROUP BY skill
       ORDER BY count DESC, skill`,
    );
  }
}

interface JobInput {
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  description: string;
}

const MAX_SKILLS_PER_JOB = 15;

export function parseJobInput(body: unknown): JobInput {
  const data = parseBody(body);
  const salaryMin = parseInteger(data.salaryMin, 'salaryMin', 0);
  const salaryMax = parseInteger(data.salaryMax, 'salaryMax', 0);
  if (salaryMax < salaryMin) throw new BadRequestException('salaryMax must be at least salaryMin');
  if (data.remote !== undefined && typeof data.remote !== 'boolean') {
    throw new BadRequestException('remote must be a boolean');
  }
  if (
    !Array.isArray(data.skills) ||
    data.skills.length < 1 ||
    data.skills.length > MAX_SKILLS_PER_JOB
  ) {
    throw new BadRequestException(`skills must have between 1 and ${MAX_SKILLS_PER_JOB} entries`);
  }
  const skills = [...new Set(data.skills.map((skill) => parseText(skill, 'skills', 40)))];
  return {
    title: parseText(data.title, 'title', 140),
    company: parseText(data.company, 'company', 120),
    location: parseText(data.location, 'location', 120),
    remote: data.remote === true,
    salaryMin,
    salaryMax,
    skills,
    description: parseText(data.description, 'description', 5000),
  };
}
