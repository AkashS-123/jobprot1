import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchApplicationsByCandidate } from '../../api/applications';
import { fetchJobById } from '../../api/jobs';
import type { Application, Job } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const Applications: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<{ application: Application; job: Job }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchApplicationsByCandidate(user.id).then(async (apps) => {
      const jobs = await Promise.all(apps.map((a) => fetchJobById(a.jobId)));
      setRows(apps.map((a, i) => ({ application: a, job: jobs[i] })));
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-ink">My applications</h1>
      <p className="mt-1 text-ink/60">Track the status of every job you've applied to.</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="py-16 text-center text-ink/50">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-200 py-16 text-center text-ink/50">
            You haven't applied to any jobs yet.{' '}
            <Link to="/jobs" className="text-brand-600 underline">
              Browse open roles
            </Link>
          </div>
        ) : (
          rows
            .sort((a, b) => +new Date(b.application.appliedAt) - +new Date(a.application.appliedAt))
            .map(({ application, job }) => (
              <div
                key={application.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white p-4 shadow-sm"
              >
                <div>
                  <Link to={`/jobs/${job.id}`} className="font-medium text-ink hover:text-brand-600">
                    {job.title}
                  </Link>
                  <p className="text-sm text-ink/50">
                    {job.company} · Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Applications;
