import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db.service.js';
import type { Application, Stage } from './board.types.js';
import { stageMoveError } from './stages.js';
import {
  parseBody,
  parseEmail,
  parseId,
  parseOptionalText,
  parseStage,
  parseText,
} from './validation.js';

const APPLICATION_SELECT = `SELECT a.id, a.job_id AS "jobId", j.title AS "jobTitle", j.company,
  a.candidate_name AS "candidateName", a.candidate_email AS "candidateEmail", a.stage, a.note,
  a.created_at AS "createdAt", a.updated_at AS "updatedAt"
  FROM applications a JOIN jobs j ON j.id = a.job_id`;

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class ApplicationsService {
  constructor(private readonly db: DbService) {}

  async apply(jobId: number, body: unknown): Promise<Application> {
    const data = parseBody(body);
    const candidateName = parseText(data.candidateName, 'candidateName', 120);
    const candidateEmail = parseEmail(data.candidateEmail);
    const note = parseOptionalText(data.note, 'note', 1000);

    const [job] = await this.db.query<{ id: number }>('SELECT id FROM jobs WHERE id = $1', [jobId]);
    if (!job) throw new NotFoundException(`job ${jobId} not found`);

    let id: number;
    try {
      const [row] = await this.db.query<{ id: number }>(
        `INSERT INTO applications (job_id, candidate_name, candidate_email, note)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [jobId, candidateName, candidateEmail, note],
      );
      id = row.id;
    } catch (err) {
      if ((err as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new ConflictException(`${candidateEmail} has already applied to this job`);
      }
      throw err;
    }
    return this.findApplication(id);
  }

  listApplications(stage?: string): Promise<Application[]> {
    const params: unknown[] = [];
    let where = '';
    if (stage !== undefined) {
      params.push(parseStage(stage));
      where = 'WHERE a.stage = $1';
    }
    return this.db.query<Application>(
      `${APPLICATION_SELECT} ${where} ORDER BY a.updated_at DESC, a.id DESC`,
      params,
    );
  }

  async moveStage(rawId: string, body: unknown): Promise<Application> {
    const id = parseId(rawId);
    const to = parseStage(parseBody(body).stage);

    const [current] = await this.db.query<{ stage: Stage }>(
      'SELECT stage FROM applications WHERE id = $1',
      [id],
    );
    if (!current) throw new NotFoundException(`application ${id} not found`);

    const problem = stageMoveError(current.stage, to);
    if (problem) throw new BadRequestException(`cannot move application: ${problem}`);

    // Guard against a concurrent move between the read above and this write.
    const updated = await this.db.query<{ id: number }>(
      'UPDATE applications SET stage = $2, updated_at = now() WHERE id = $1 AND stage = $3 RETURNING id',
      [id, to, current.stage],
    );
    if (updated.length === 0) {
      throw new ConflictException('application was moved by someone else; reload and try again');
    }
    return this.findApplication(id);
  }

  private async findApplication(id: number): Promise<Application> {
    const [application] = await this.db.query<Application>(
      `${APPLICATION_SELECT} WHERE a.id = $1`,
      [id],
    );
    return application;
  }
}
