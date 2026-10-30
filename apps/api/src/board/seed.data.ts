import type { Stage } from './board.types.js';

// Fixed ids and UTC timestamps keep the seed deterministic, so inserting it again is a no-op.

export interface SeedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  description: string;
  postedAt: string;
}

export interface SeedApplication {
  id: number;
  jobId: number;
  candidateName: string;
  candidateEmail: string;
  stage: Stage;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export const SEED_JOBS: SeedJob[] = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'Northwind Labs',
    location: 'Berlin, Germany',
    remote: false,
    salaryMin: 95000,
    salaryMax: 125000,
    skills: ['TypeScript', 'React', 'CSS'],
    description:
      'Own the design system and the customer dashboard used by 40,000 weekly active teams. You will pair with product designers, set performance budgets and mentor two engineers.',
    postedAt: '2026-10-27T09:00:00Z',
  },
  {
    id: 2,
    title: 'Backend Engineer, Payments',
    company: 'Kestrel Payments',
    location: 'Remote (EU)',
    remote: true,
    salaryMin: 90000,
    salaryMax: 120000,
    skills: ['Node.js', 'TypeScript', 'PostgreSQL'],
    description:
      'Build the ledger services that move money for merchants across 12 countries. Strong focus on correctness, idempotency and observable failure modes.',
    postedAt: '2026-10-26T14:30:00Z',
  },
  {
    id: 3,
    title: 'Data Analyst',
    company: 'Lumen Analytics',
    location: 'London, UK',
    remote: false,
    salaryMin: 55000,
    salaryMax: 70000,
    skills: ['SQL', 'Python', 'Tableau'],
    description:
      'Turn product usage data into decisions for our growth and retention teams. You will own weekly reporting, build self-serve dashboards and run experiment reads.',
    postedAt: '2026-10-24T08:15:00Z',
  },
  {
    id: 4,
    title: 'Platform Engineer',
    company: 'Atlas Cloud',
    location: 'Remote (US)',
    remote: true,
    salaryMin: 120000,
    salaryMax: 155000,
    skills: ['Go', 'Kubernetes', 'Terraform'],
    description:
      'Run the internal platform that thousands of services deploy onto. Expect to write controllers in Go, review infrastructure changes and improve developer onboarding.',
    postedAt: '2026-10-23T10:00:00Z',
  },
  {
    id: 5,
    title: 'Product Designer',
    company: 'Fieldstone Studio',
    location: 'Amsterdam, Netherlands',
    remote: false,
    salaryMin: 70000,
    salaryMax: 90000,
    skills: ['Figma', 'User Research', 'Prototyping'],
    description:
      'Shape end-to-end flows for a booking product used by independent clinics. You will run research sprints, prototype quickly and partner closely with engineering.',
    postedAt: '2026-10-22T16:45:00Z',
  },
  {
    id: 6,
    title: 'iOS Engineer',
    company: 'Orbit Logistics',
    location: 'Madrid, Spain',
    remote: false,
    salaryMin: 75000,
    salaryMax: 98000,
    skills: ['Swift', 'SwiftUI', 'GraphQL'],
    description:
      'Ship the driver app used on more than 8,000 routes each day. You will modernise the offline sync layer and take ownership of crash-free session targets.',
    postedAt: '2026-10-21T11:20:00Z',
  },
  {
    id: 7,
    title: 'Machine Learning Engineer',
    company: 'Cobalt Robotics',
    location: 'Remote (Worldwide)',
    remote: true,
    salaryMin: 130000,
    salaryMax: 170000,
    skills: ['Python', 'PyTorch', 'AWS'],
    description:
      'Train and ship perception models that run on warehouse robots. You will own training pipelines, evaluation harnesses and on-device latency budgets.',
    postedAt: '2026-10-20T09:30:00Z',
  },
  {
    id: 8,
    title: 'QA Automation Engineer',
    company: 'Maple Commerce',
    location: 'Toronto, Canada',
    remote: false,
    salaryMin: 65000,
    salaryMax: 85000,
    skills: ['Playwright', 'TypeScript', 'CI/CD'],
    description:
      'Grow the end-to-end suite that guards checkout across six storefronts. You will design stable test fixtures, triage flakes and coach product teams on testing.',
    postedAt: '2026-10-18T13:00:00Z',
  },
  {
    id: 9,
    title: 'Site Reliability Engineer',
    company: 'Atlas Cloud',
    location: 'Dublin, Ireland',
    remote: false,
    salaryMin: 100000,
    salaryMax: 135000,
    skills: ['Kubernetes', 'Go', 'Observability'],
    description:
      'Keep the control plane available for enterprise customers. You will lead incident reviews, define SLOs and build the alerting that wakes the right person.',
    postedAt: '2026-10-16T07:45:00Z',
  },
  {
    id: 10,
    title: 'Junior Full-Stack Developer',
    company: 'Ember Education',
    location: 'Remote (EU)',
    remote: true,
    salaryMin: 45000,
    salaryMax: 58000,
    skills: ['React', 'Node.js', 'PostgreSQL'],
    description:
      'Join a small team building tools for teachers and school administrators. You will ship features end to end, with close code review and a structured mentoring plan.',
    postedAt: '2026-10-15T15:10:00Z',
  },
  {
    id: 11,
    title: 'Clinical Data Engineer',
    company: 'Brightpath Health',
    location: 'Boston, USA',
    remote: false,
    salaryMin: 110000,
    salaryMax: 140000,
    skills: ['Python', 'SQL', 'Airflow'],
    description:
      'Build the pipelines that turn trial site data into analysis-ready datasets. Work closely with biostatisticians and keep every transformation auditable.',
    postedAt: '2026-10-12T10:30:00Z',
  },
  {
    id: 12,
    title: 'Staff Engineer, Payments',
    company: 'Tidewater Finance',
    location: 'New York, USA',
    remote: false,
    salaryMin: 170000,
    salaryMax: 210000,
    skills: ['Java', 'Kafka', 'PostgreSQL'],
    description:
      'Lead the settlement platform that clears transactions for institutional clients. You will set technical direction for three teams and own the migration off our legacy batch system.',
    postedAt: '2026-10-09T12:00:00Z',
  },
  {
    id: 13,
    title: 'Growth Marketing Manager',
    company: 'Harbor & Pine',
    location: 'Remote (US)',
    remote: true,
    salaryMin: 80000,
    salaryMax: 105000,
    skills: ['SEO', 'Analytics', 'Copywriting'],
    description:
      'Own acquisition for a consumer finance app. You will plan channel experiments, set budgets against payback targets and report results to the leadership team.',
    postedAt: '2026-10-06T09:00:00Z',
  },
  {
    id: 14,
    title: 'Developer Advocate',
    company: 'Quarry Systems',
    location: 'Remote (Worldwide)',
    remote: true,
    salaryMin: 85000,
    salaryMax: 110000,
    skills: ['TypeScript', 'Technical Writing', 'Go'],
    description:
      'Make our open-source database easy to adopt. You will write tutorials, record demos, answer community questions and bring field feedback back to the product team.',
    postedAt: '2026-10-02T17:20:00Z',
  },
];

export const SEED_APPLICATIONS: SeedApplication[] = [
  app(
    1,
    1,
    'Lukas Brandt',
    'lukas.brandt@example.com',
    'interview',
    'Strong React portfolio; panel on Thursday.',
    '2026-10-28T10:00:00Z',
  ),
  app(
    2,
    2,
    'Priya Raman',
    'priya.raman@example.com',
    'offer',
    'Verbal offer discussed; waiting on comp sign-off.',
    '2026-10-29T09:15:00Z',
  ),
  app(
    3,
    1,
    'Amara Okafor',
    'amara.okafor@example.com',
    'screening',
    'Recruiter call booked for next week.',
    '2026-10-28T14:00:00Z',
  ),
  app(
    4,
    4,
    'Hiro Tanaka',
    'hiro.tanaka@example.com',
    'interview',
    'Took the Terraform exercise, scored well.',
    '2026-10-27T11:30:00Z',
  ),
  app(5, 3, 'Sofia Marin', 'sofia.marin@example.com', 'applied', null, '2026-10-29T08:40:00Z'),
  app(
    6,
    5,
    'Elena Petrova',
    'elena.petrova@example.com',
    'screening',
    'Portfolio review pending.',
    '2026-10-26T16:10:00Z',
  ),
  app(
    7,
    7,
    'Daniel Reyes',
    'daniel.reyes@example.com',
    'rejected',
    'Not enough production ML experience.',
    '2026-10-25T13:05:00Z',
  ),
  app(8, 8, 'Tom Whitaker', 'tom.whitaker@example.com', 'applied', null, '2026-10-29T10:25:00Z'),
  app(9, 10, 'Yuki Sato', 'yuki.sato@example.com', 'applied', null, '2026-10-28T17:45:00Z'),
  app(
    10,
    11,
    'Maya Cohen',
    'maya.cohen@example.com',
    'interview',
    'Airflow experience is a strong match.',
    '2026-10-27T15:20:00Z',
  ),
  app(
    11,
    12,
    'Omar Haddad',
    'omar.haddad@example.com',
    'offer',
    'Final loop passed unanimously.',
    '2026-10-26T12:00:00Z',
  ),
  app(12, 9, 'Chloe Dubois', 'chloe.dubois@example.com', 'applied', null, '2026-10-24T09:30:00Z'),
  app(13, 2, 'Ravi Menon', 'ravi.menon@example.com', 'screening', null, '2026-10-27T18:00:00Z'),
  app(
    14,
    6,
    'Nina Kowalski',
    'nina.kowalski@example.com',
    'rejected',
    'Relocation not possible for this role.',
    '2026-10-23T10:50:00Z',
  ),
  app(15, 13, 'Ethan Brooks', 'ethan.brooks@example.com', 'applied', null, '2026-10-28T08:15:00Z'),
  app(
    16,
    14,
    'Lena Fischer',
    'lena.fischer@example.com',
    'interview',
    'Demo video requested.',
    '2026-10-25T14:35:00Z',
  ),
  app(
    17,
    1,
    'Mateo Silva',
    'mateo.silva@example.com',
    'rejected',
    'Experience below the senior bar.',
    '2026-10-24T11:00:00Z',
  ),
  app(
    18,
    4,
    'Grace Okonkwo',
    'grace.okonkwo@example.com',
    'screening',
    null,
    '2026-10-26T09:45:00Z',
  ),
  app(19, 9, 'Felix Berg', 'felix.berg@example.com', 'applied', null, '2026-10-29T13:10:00Z'),
  app(
    20,
    14,
    'Ines Costa',
    'ines.costa@example.com',
    'offer',
    'Offer letter drafted.',
    '2026-10-28T16:30:00Z',
  ),
];

function app(
  id: number,
  jobId: number,
  candidateName: string,
  candidateEmail: string,
  stage: Stage,
  note: string | null,
  updatedAt: string,
): SeedApplication {
  const createdAt = new Date(new Date(updatedAt).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  return { id, jobId, candidateName, candidateEmail, stage, note, createdAt, updatedAt };
}
