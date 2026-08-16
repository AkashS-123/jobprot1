import api from './client';
import type { Application, ApplicationStatus } from '../types';

export async function fetchApplicationsByCandidate(candidateId: string): Promise<Application[]> {
  const res = await api.get('/applications', {
    params: { candidateId, _sort: 'appliedAt', _order: 'desc' },
  });
  return res.data;
}

export async function fetchApplicationsByJob(jobId: string): Promise<Application[]> {
  const res = await api.get('/applications', {
    params: { jobId, _sort: 'appliedAt', _order: 'desc' },
  });
  return res.data;
}

export async function fetchApplicationsForHrJobs(jobIds: string[]): Promise<Application[]> {
  if (jobIds.length === 0) return [];
  const res = await api.get('/applications');
  const all: Application[] = res.data;
  return all.filter((a) => jobIds.includes(a.jobId));
}

export async function fetchApplicationForJobAndCandidate(
  jobId: string,
  candidateId: string
): Promise<Application | null> {
  const res = await api.get('/applications', { params: { jobId, candidateId } });
  return res.data[0] ?? null;
}

export async function createApplication(payload: {
  jobId: string;
  candidateId: string;
  coverLetter: string;
}): Promise<Application> {
  const now = new Date().toISOString();
  const res = await api.post('/applications', {
    ...payload,
    status: 'applied' as ApplicationStatus,
    appliedAt: now,
    updatedAt: now,
  });
  return res.data;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Application> {
  const res = await api.patch(`/applications/${id}`, {
    status,
    updatedAt: new Date().toISOString(),
  });
  return res.data;
}
