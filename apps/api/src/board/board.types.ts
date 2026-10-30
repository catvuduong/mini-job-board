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
  postedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}
