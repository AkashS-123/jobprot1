export type Role = 'candidate' | 'hr';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  // Candidate profile fields
  headline?: string;
  location?: string;
  phone?: string;
  skills?: string[];
  experienceYears?: number;
  bio?: string;
  resumeUrl?: string;
  // HR profile fields
  company?: string;
  companyTitle?: string;
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
export type JobStatus = 'open' | 'closed';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  status: JobStatus;
  postedBy: string; // HR user id
  postedAt: string; // ISO date
}

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'offered'
  | 'rejected';

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  coverLetter: string;
  appliedAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: string;
  candidateId: string;
  jobId: string;
  savedAt: string;
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied',
  'under_review',
  'shortlisted',
  'interview',
  'offered',
  'rejected',
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  under_review: 'Under review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offered: 'Offered',
  rejected: 'Rejected',
};
