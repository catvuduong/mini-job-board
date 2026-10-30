// Mirrors the JSON returned by apps/api. Dates arrive as ISO 8601 strings in UTC.

export const STAGES = ['applied', 'screening', 'interview', 'offer', 'rejected'] as const;

export type Stage = (typeof STAGES)[number];

export interface Job {
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

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  candidateName: string;
  candidateEmail: string;
  stage: Stage;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  jobs: { total: number };
  applications: { total: number; byStage: Record<Stage, number> };
  topSkills: Array<{ skill: string; jobCount: number; averageSalary: number }>;
}
