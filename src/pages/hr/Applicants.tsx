import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchJobById } from '../../api/jobs';
import { fetchApplicationsByJob, updateApplicationStatus } from '../../api/applications';
import { fetchUserById } from '../../api/users';
import type { Job, Application, User, ApplicationStatus } from '../../types';
import { APPLICATION_STATUSES, STATUS_LABELS } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const Applicants: React.FC = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [rows, setRows] = useState<{ application: Application; candidate: User }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState('');

  const load = async () => {
    if (!jobId) return;
    setLoading(true);
    const [j, apps] = await Promise.all([fetchJobById(jobId), fetchApplicationsByJob(jobId)]);
    setJob(j);
    const candidates = await Promise.all(apps.map((a) => fetchUserById(a.candidateId)));
    setRows(apps.map((a, i) => ({ application: a, candidate: candidates[i] })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const filtered = useMemo(() => {
    return rows.filter(({ application, candidate }) => {
      if (statusFilter !== 'all' && application.status !== statusFilter) return false;
      if (skillFilter) {
        const needle = skillFilter.toLowerCase();
        const hasSkill = (candidate.skills ?? []).some((s) => s.toLowerCase().includes(needle));
        if (!hasSkill) return false;
      }
      return true;
    });
  }, [rows, statusFilter, skillFilter]);

  const handleStatusChange = async (applicationId: string, status: ApplicationStatus) => {
    const updated = await updateApplicationStatus(applicationId, status);
    setRows((prev) =>
      prev.map((r) => (r.application.id === applicationId ? { ...r, application: updated } : r))
    );
  };

  if (loading) return <div className="py-24 text-center text-ink/50">Loading…</div>;
  if (!job) return <div className="py-24 text-center text-ink/50">Job not found.</div>;
  if (user && job.postedBy !== user.id)
    return (
      <div className="py-24 text-center text-ink/50">
        You can only view applicants for jobs you posted.
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/hr" className="text-sm text-brand-600 hover:underline">
        ← Back to postings
      </Link>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{job.title}</h1>
      <p className="mt-1 text-ink/60">
        {rows.length} applicant{rows.length === 1 ? '' : 's'} · {job.location}
      </p>

      <div className="mt-6 flex flex-wrap gap-3 rounded-xl border border-brand-100 bg-white p-4 shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
          className="rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          placeholder="Filter by candidate skill…"
          className="min-w-[220px] flex-1 rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
        />
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-200 py-16 text-center text-ink/50">
            No applicants match these filters.
          </div>
        ) : (
          filtered.map(({ application, candidate }) => (
            <div
              key={application.id}
              className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/hr/candidates/${candidate.id}`}
                    className="font-medium text-ink hover:text-brand-600"
                  >
                    {candidate.name}
                  </Link>
                  <p className="text-sm text-ink/50">
                    {candidate.headline ?? 'No headline'} · {candidate.location ?? '—'}
                  </p>
                  <p className="mt-1 text-xs text-ink/40">
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>

              {application.coverLetter && (
                <p className="mt-3 rounded-md bg-brand-50/60 p-3 text-sm text-ink/70">
                  “{application.coverLetter}”
                </p>
              )}

              {(candidate.skills ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(candidate.skills ?? []).map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-ink/60">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-ink/50">
                  Update status
                </label>
                <select
                  value={application.status}
                  onChange={(e) =>
                    handleStatusChange(application.id, e.target.value as ApplicationStatus)
                  }
                  className="rounded-md border border-brand-200 px-2.5 py-1.5 text-sm focus:border-brand-500"
                >
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <Link
                  to={`/hr/candidates/${candidate.id}`}
                  className="ml-auto text-sm font-medium text-brand-600 hover:underline"
                >
                  View profile →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Applicants;
