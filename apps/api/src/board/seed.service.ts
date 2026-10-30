import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DbService } from '../db.service.js';
import { SEED_APPLICATIONS, SEED_JOBS } from './seed.data.js';

// Inserts the sample board on startup. Rows have fixed ids and ON CONFLICT DO NOTHING, so every boot is a no-op
// once the data is present, and it never overwrites rows that users have changed.
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly db: DbService) {}

  async onApplicationBootstrap() {
    if (!this.db.enabled) return;
    try {
      await this.seed();
    } catch (err) {
      this.logger.error(`Seeding the sample job board failed: ${(err as Error).message}`);
    }
  }

  async seed(): Promise<void> {
    const jobs = insertRows(
      'jobs',
      [
        'id',
        'title',
        'company',
        'location',
        'remote',
        'salary_min',
        'salary_max',
        'skills',
        'description',
        'posted_at',
      ],
      SEED_JOBS.map((job) => [
        job.id,
        job.title,
        job.company,
        job.location,
        job.remote,
        job.salaryMin,
        job.salaryMax,
        job.skills,
        job.description,
        job.postedAt,
      ]),
    );
    await this.db.query(jobs.sql, jobs.params);

    const applications = insertRows(
      'applications',
      [
        'id',
        'job_id',
        'candidate_name',
        'candidate_email',
        'stage',
        'note',
        'created_at',
        'updated_at',
      ],
      SEED_APPLICATIONS.map((application) => [
        application.id,
        application.jobId,
        application.candidateName,
        application.candidateEmail,
        application.stage,
        application.note,
        application.createdAt,
        application.updatedAt,
      ]),
    );
    await this.db.query(applications.sql, applications.params);

    // Explicit ids do not advance the SERIAL sequences, so move them past the seeded rows.
    await this.db.query(
      `SELECT setval(pg_get_serial_sequence('jobs', 'id'), (SELECT MAX(id) FROM jobs)),
              setval(pg_get_serial_sequence('applications', 'id'), (SELECT MAX(id) FROM applications))`,
    );
  }
}

function insertRows(
  table: string,
  columns: string[],
  rows: unknown[][],
): { sql: string; params: unknown[] } {
  const params: unknown[] = [];
  const values = rows.map((row) => {
    const placeholders = row.map((value) => {
      params.push(value);
      return `$${params.length}`;
    });
    return `(${placeholders.join(', ')})`;
  });
  return {
    sql: `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values.join(', ')} ON CONFLICT DO NOTHING`,
    params,
  };
}
