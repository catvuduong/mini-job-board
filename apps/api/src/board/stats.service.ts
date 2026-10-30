import { Injectable } from '@nestjs/common';
import { DbService } from '../db.service.js';
import { STAGES, type Stage } from './board.types.js';

export interface SkillStat {
  skill: string;
  jobCount: number;
  // Average of each job's salary midpoint, rounded to the nearest unit.
  averageSalary: number;
}

export interface Stats {
  jobs: { total: number };
  applications: { total: number; byStage: Record<Stage, number> };
  topSkills: SkillStat[];
}

const TOP_SKILL_COUNT = 5;

@Injectable()
export class StatsService {
  constructor(private readonly db: DbService) {}

  async getStats(): Promise<Stats> {
    const [jobs] = await this.db.query<{ total: number }>(
      'SELECT count(*)::int AS total FROM jobs',
    );
    const stageRows = await this.db.query<{ stage: Stage; count: number }>(
      'SELECT stage, count(*)::int AS count FROM applications GROUP BY stage',
    );
    const topSkills = await this.db.query<SkillStat>(
      `SELECT skill, count(*)::int AS "jobCount",
         round(avg((jobs.salary_min + jobs.salary_max) / 2.0))::int AS "averageSalary"
       FROM jobs CROSS JOIN LATERAL unnest(jobs.skills) AS s(skill)
       GROUP BY skill
       ORDER BY "jobCount" DESC, skill
       LIMIT $1`,
      [TOP_SKILL_COUNT],
    );

    const byStage = Object.fromEntries(STAGES.map((stage) => [stage, 0])) as Record<Stage, number>;
    for (const row of stageRows) byStage[row.stage] = row.count;
    const total = Object.values(byStage).reduce((sum, count) => sum + count, 0);

    return { jobs: { total: jobs.total }, applications: { total, byStage }, topSkills };
  }
}
