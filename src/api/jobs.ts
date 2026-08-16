import api from './client';
import type { Job } from '../types';

export interface JobFilters {
  q?: string;
  location?: string;
  type?: string;
  salaryMin?: number;
  status?: 'open' | 'closed';
  postedBy?: string;
  _page?: number;
  _limit?: number;
}

export interface JobListResult {
  jobs: Job[];
  total: number;
}

export async function fetchJobs(filters: JobFilters): Promise<JobListResult> {
  const params: Record<string, any> = {
    _page: filters._page ?? 1,
    _limit: filters._limit ?? 6,
    _sort: 'postedAt',
    _order: 'desc',
  };
  if (filters.q) params.q = filters.q;
  if (filters.location) params.location_like = filters.location;
  if (filters.type) params.type = filters.type;
  if (filters.status) params.status = filters.status;
  if (filters.postedBy) params.postedBy = filters.postedBy;
  if (filters.salaryMin) params.salaryMax_gte = filters.salaryMin;

  const res = await api.get('/jobs', { params });
  let jobs: Job[] = res.data;
  const total = Number(res.headers['x-total-count'] ?? jobs.length);

  return { jobs, total };
}

export async function fetchJobById(id: string): Promise<Job> {
  const res = await api.get(`/jobs/${id}`);
  return res.data;
}

export async function createJob(job: Omit<Job, 'id'>): Promise<Job> {
  const res = await api.post('/jobs', job);
  return res.data;
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<Job> {
  const res = await api.patch(`/jobs/${id}`, patch);
  return res.data;
}

export async function deleteJob(id: string): Promise<void> {
  await api.delete(`/jobs/${id}`);
}
