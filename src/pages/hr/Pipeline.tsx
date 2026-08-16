import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchJobs } from '../../api/jobs';
import { fetchApplicationsForHrJobs, updateApplicationStatus } from '../../api/applications';
import { fetchUserById } from '../../api/users';
import type { Job, Application, User, ApplicationStatus } from '../../types';
import { APPLICATION_STATUSES, STATUS_LABELS } from '../../types';

const Pipeline: React.FC = () => {
  const { user } = useAuth();
  const [jobsById, setJobsById] = useState<Record<string, Job>>({});
  const [candidatesById, setCandidatesById] = useState<Record<string, User>>({});
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { jobs } = await fetchJobs({ postedBy: user.id, _limit: 100 });
      const jMap: Record<string, Job> = {};
      jobs.forEach((j) => (jMap[j.id] = j));
      setJobsById(jMap);

      const apps = await fetchApplicationsForHrJobs(jobs.map((j) => j.id));
      setApplications(apps);

      const uniqueCandidateIds = Array.from(new Set(apps.map((a) => a.candidateId)));
      const candidates = await Promise.all(uniqueCandidateIds.map((id) => fetchUserById(id)));
      const cMap: Record<string, User> = {};
      candidates.forEach((c) => (cMap[c.id] = c));
      setCandidatesById(cMap);

      setLoading(false);
    })();
  }, [user]);

  const handleDrop = async (applicationId: string, status: ApplicationStatus) => {
    const updated = await updateApplicationStatus(applicationId, status);
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? updated : a)));
  };

  const visibleApps = applications.filter((a) => jobFilter === 'all' || a.jobId === jobFilter);

  if (loading) return <div className="py-24 text-center text-ink/50">Loading…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Recruitment pipeline</h1>
      <p className="mt-1 text-ink/60">
        A single view of every applicant across your open roles. Update status inline.
      </p>

      <select
        value={jobFilter}
        onChange={(e) => setJobFilter(e.target.value)}
        className="mt-4 rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
      >
        <option value="all">All jobs</option>
        {Object.values(jobsById).map((j) => (
          <option key={j.id} value={j.id}>
            {j.title}
          </option>
        ))}
      </select>

      <div className="mt-6 grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-3 lg:grid-cols-6">
        {APPLICATION_STATUSES.map((status) => {
          const apps = visibleApps.filter((a) => a.status === status);
          return (
            <div key={status} className="min-w-[220px] rounded-xl bg-brand-50/60 p-3">
              <h2 className="mb-3 text-sm font-semibold text-brand-700">
                {STATUS_LABELS[status]} <span className="text-ink/40">({apps.length})</span>
              </h2>
              <div className="space-y-2">
                {apps.map((a) => {
                  const candidate = candidatesById[a.candidateId];
                  const job = jobsById[a.jobId];
                  return (
                    <div key={a.id} className="rounded-lg border border-brand-100 bg-white p-3 shadow-sm">
                      <Link
                        to={`/hr/candidates/${a.candidateId}`}
                        className="text-sm font-medium text-ink hover:text-brand-600"
                      >
                        {candidate?.name ?? '—'}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink/50">{job?.title}</p>
                      <select
                        value={a.status}
                        onChange={(e) => handleDrop(a.id, e.target.value as ApplicationStatus)}
                        className="mt-2 w-full rounded-md border border-brand-200 px-2 py-1 text-xs"
                      >
                        {APPLICATION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
                {apps.length === 0 && <p className="text-xs text-ink/30">No candidates</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
