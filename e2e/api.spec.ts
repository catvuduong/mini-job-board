import { test, expect, type APIRequestContext } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3001';
const STAGES = ['applied', 'screening', 'interview', 'offer', 'rejected'];

interface JobPage {
  items: Array<{ id: number; title: string; location: string; remote: boolean; salaryMax: number; skills: string[]; postedAt: string }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface Application {
  id: number;
  jobId: number;
  stage: string;
  candidateEmail: string;
}

// Unique per run, so repeated runs against the same database never collide.
const run = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function listJobs(request: APIRequestContext, query: string): Promise<JobPage> {
  const res = await request.get(`${API}/jobs?${query}`);
  expect(res.status(), query).toBe(200);
  return res.json();
}

async function createJob(request: APIRequestContext, title: string): Promise<number> {
  const res = await request.post(`${API}/jobs`, {
    data: {
      title,
      company: 'E2E Corp',
      location: 'Nowhere',
      remote: true,
      salaryMin: 50000,
      salaryMax: 60000,
      skills: ['E2E'],
      description: 'Created by the API e2e suite.',
    },
  });
  expect(res.status()).toBe(201);
  return (await res.json()).id;
}

async function apply(request: APIRequestContext, jobId: number, email: string) {
  return request.post(`${API}/jobs/${jobId}/applications`, {
    data: { candidateName: 'Test Candidate', candidateEmail: email },
  });
}

test.describe('jobs API', () => {
  test('lists seeded jobs newest first with pagination metadata', async ({ request }) => {
    const page = await listJobs(request, 'pageSize=5');
    expect(page.total).toBeGreaterThanOrEqual(14);
    expect(page.items).toHaveLength(5);
    expect(page.totalPages).toBe(Math.ceil(page.total / 5));

    const times = page.items.map((job) => Date.parse(job.postedAt));
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  test('pages do not overlap', async ({ request }) => {
    const first = await listJobs(request, 'pageSize=4&page=1');
    const second = await listJobs(request, 'pageSize=4&page=2');
    const firstIds = new Set(first.items.map((job) => job.id));
    expect(second.items.some((job) => firstIds.has(job.id))).toBe(false);
  });

  test('skill filter requires every selected skill', async ({ request }) => {
    const single = await listJobs(request, 'skill=TypeScript&pageSize=50');
    expect(single.total).toBeGreaterThanOrEqual(4);
    for (const job of single.items) expect(job.skills).toContain('TypeScript');

    const both = await listJobs(request, 'skill=TypeScript&skill=Go&pageSize=50');
    for (const job of both.items) {
      expect(job.skills).toEqual(expect.arrayContaining(['TypeScript', 'Go']));
    }
    expect(both.total).toBeLessThanOrEqual(single.total);
  });

  test('combines remote, minSalary and location filters', async ({ request }) => {
    const page = await listJobs(request, 'remote=true&minSalary=120000&location=remote&pageSize=50');
    expect(page.total).toBeGreaterThan(0);
    for (const job of page.items) {
      expect(job.remote).toBe(true);
      expect(job.salaryMax).toBeGreaterThanOrEqual(120000);
      expect(job.location.toLowerCase()).toContain('remote');
    }
  });

  test('remote=false returns only on-site roles', async ({ request }) => {
    const page = await listJobs(request, 'remote=false&pageSize=50');
    expect(page.total).toBeGreaterThan(0);
    for (const job of page.items) expect(job.remote).toBe(false);
  });

  test('free-text search matches title and company', async ({ request }) => {
    const title = `Quantum Kiln Engineer ${run}`;
    const id = await createJob(request, title);

    const page = await listJobs(request, `q=${encodeURIComponent(title)}`);
    expect(page.items.map((job) => job.id)).toEqual([id]);
  });

  test('sorts by salary, highest maximum first', async ({ request }) => {
    const page = await listJobs(request, 'sort=salary&pageSize=50');
    const maxima = page.items.map((job) => job.salaryMax);
    expect([...maxima].sort((a, b) => b - a)).toEqual(maxima);
  });

  test('returns 400 for invalid filter values', async ({ request }) => {
    for (const query of ['remote=maybe', 'sort=price', 'minSalary=-5', 'pageSize=500', 'page=0']) {
      const res = await request.get(`${API}/jobs?${query}`);
      expect(res.status(), query).toBe(400);
    }
  });

  test('gets one job and returns 404 or 400 for bad ids', async ({ request }) => {
    const list = await listJobs(request, 'pageSize=1');
    const res = await request.get(`${API}/jobs/${list.items[0].id}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).id).toBe(list.items[0].id);

    expect((await request.get(`${API}/jobs/999999999`)).status()).toBe(404);
    expect((await request.get(`${API}/jobs/abc`)).status()).toBe(400);
  });

  test('lists skills with counts', async ({ request }) => {
    const res = await request.get(`${API}/jobs/skills`);
    expect(res.status()).toBe(200);
    const skills: Array<{ name: string; count: number }> = await res.json();
    expect(skills.some((skill) => skill.name === 'TypeScript')).toBe(true);
    const counts = skills.map((skill) => skill.count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });

  test('rejects a job with a salary range that is inverted', async ({ request }) => {
    const res = await request.post(`${API}/jobs`, {
      data: {
        title: 'Bad Range',
        company: 'E2E Corp',
        location: 'Nowhere',
        salaryMin: 90000,
        salaryMax: 80000,
        skills: ['E2E'],
        description: 'Invalid.',
      },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).message).toMatch(/salaryMax must be at least salaryMin/);
  });
});

test.describe('applications API', () => {
  test('applying stores an application in the applied stage', async ({ request }) => {
    const jobId = await createJob(request, `Apply Target ${run}`);
    const email = `first.${run}@example.com`;

    const res = await apply(request, jobId, email);
    expect(res.status()).toBe(201);
    const application: Application = await res.json();
    expect(application).toMatchObject({ jobId, stage: 'applied', candidateEmail: email });
  });

  test('a second application with the same email (any case) for the same job is a 409', async ({ request }) => {
    const jobId = await createJob(request, `Duplicate Target ${run}`);
    expect((await apply(request, jobId, `dup.${run}@example.com`)).status()).toBe(201);

    const res = await apply(request, jobId, `DUP.${run}@Example.com`);
    expect(res.status()).toBe(409);
  });

  test('the same email may apply to a different job', async ({ request }) => {
    const first = await createJob(request, `Multi A ${run}`);
    const second = await createJob(request, `Multi B ${run}`);
    const email = `multi.${run}@example.com`;
    expect((await apply(request, first, email)).status()).toBe(201);
    expect((await apply(request, second, email)).status()).toBe(201);
  });

  test('rejects an invalid email or missing name with 400', async ({ request }) => {
    const jobId = await createJob(request, `Validation Target ${run}`);
    const badEmail = await request.post(`${API}/jobs/${jobId}/applications`, {
      data: { candidateName: 'Test', candidateEmail: 'not-an-email' },
    });
    expect(badEmail.status()).toBe(400);
    expect((await badEmail.json()).message).toMatch(/valid email/);

    const noName = await request.post(`${API}/jobs/${jobId}/applications`, {
      data: { candidateName: '  ', candidateEmail: `ok.${run}@example.com` },
    });
    expect(noName.status()).toBe(400);
  });

  test('applying to an unknown job is a 404', async ({ request }) => {
    expect((await apply(request, 999999999, `ghost.${run}@example.com`)).status()).toBe(404);
  });

  test('lists applications filtered by stage', async ({ request }) => {
    const res = await request.get(`${API}/applications?stage=interview`);
    expect(res.status()).toBe(200);
    const applications: Application[] = await res.json();
    expect(applications.length).toBeGreaterThan(0);
    for (const application of applications) expect(application.stage).toBe('interview');
  });

  test('rejects an unknown stage filter with 400', async ({ request }) => {
    expect((await request.get(`${API}/applications?stage=hired`)).status()).toBe(400);
  });

  test('moves forward, rejects backward and same-stage moves with 400', async ({ request }) => {
    const jobId = await createJob(request, `Pipeline Target ${run}`);
    const application: Application = await (await apply(request, jobId, `pipe.${run}@example.com`)).json();
    const move = (stage: unknown) =>
      request.patch(`${API}/applications/${application.id}/stage`, { data: { stage } });

    const screening = await move('screening');
    expect(screening.status()).toBe(200);
    expect((await screening.json()).stage).toBe('screening');

    expect((await move('applied')).status()).toBe(400);
    expect((await move('screening')).status()).toBe(400);
    expect((await move('bogus')).status()).toBe(400);
    expect((await move(undefined)).status()).toBe(400);

    expect((await move('offer')).status()).toBe(200);
    expect((await move('rejected')).status()).toBe(200);
    expect((await move('interview')).status()).toBe(400);
    expect((await move('rejected')).status()).toBe(400);
  });

  test('moving an unknown application is a 404', async ({ request }) => {
    const res = await request.patch(`${API}/applications/999999999/stage`, { data: { stage: 'screening' } });
    expect(res.status()).toBe(404);
  });
});

test.describe('stats API', () => {
  test('reports job count, applications per stage and top skills', async ({ request }) => {
    const res = await request.get(`${API}/stats`);
    expect(res.status()).toBe(200);
    const stats = await res.json();

    expect(stats.jobs.total).toBeGreaterThanOrEqual(14);
    expect(Object.keys(stats.applications.byStage)).toEqual(STAGES);
    const stageSum = STAGES.reduce((sum, stage) => sum + stats.applications.byStage[stage], 0);
    expect(stats.applications.total).toBe(stageSum);
    expect(stats.applications.byStage.interview).toBeGreaterThan(0);

    expect(stats.topSkills).toHaveLength(5);
    const counts = stats.topSkills.map((skill: { jobCount: number }) => skill.jobCount);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
    for (const skill of stats.topSkills) {
      expect(skill.averageSalary).toBeGreaterThan(0);
    }
  });
});

test.describe('seed data', () => {
  test('the seeded jobs and applications are present after startup', async ({ request }) => {
    const page = await listJobs(request, 'pageSize=50');
    const titles = page.items.map((job) => job.title);
    expect(titles).toEqual(expect.arrayContaining(['Senior Frontend Engineer', 'Developer Advocate']));
  });
});
