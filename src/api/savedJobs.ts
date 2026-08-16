import api from './client';
import type { SavedJob } from '../types';

export async function fetchSavedJobs(candidateId: string): Promise<SavedJob[]> {
  const res = await api.get('/savedJobs', { params: { candidateId } });
  return res.data;
}

export async function saveJob(candidateId: string, jobId: string): Promise<SavedJob> {
  const res = await api.post('/savedJobs', {
    candidateId,
    jobId,
    savedAt: new Date().toISOString(),
  });
  return res.data;
}

export async function unsaveJob(savedJobId: string): Promise<void> {
  await api.delete(`/savedJobs/${savedJobId}`);
}
