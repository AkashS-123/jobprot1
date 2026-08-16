import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchJobs, updateJob, deleteJob } from '../../api/jobs';
import { fetchApplicationsForHrJobs } from '../../api/applications';
import type { Job } from '../../types';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 8;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const res = await fetchJobs({
      postedBy: user.id,
      status: statusFilter === 'all' ? undefined : statusFilter,
      _page: page,
      _limit: PAGE_SIZE,
    });
    setJobs(res.jobs);
    setTotal(res.total);

    const apps = await fetchApplicationsForHrJobs(res.jobs.map((j) => j.id));
    const counts: Record<string, number> = {};
    apps.forEach((a) => {
      counts[a.jobId] = (counts[a.jobId] ?? 0) + 1;
    });
    setApplicantCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, statusFilter]);

  const toggleStatus = async (job: Job) => {
    const updated = await updateJob(job.id, { status: job.status === 'open' ? 'closed' : 'open' });
    setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
  };

  const remove = async (job: Job) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    await deleteJob(job.id);
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Job postings</h1>
          <p className="mt-1 text-ink/60">Manage roles for {user?.company ?? 'your company'}.</p>
        </div>
        <button
          onClick={() => navigate('/hr/jobs/new')}
          className="rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + Post a new job
        </button>
      </div>

      <div className="mt-6 flex gap-2">
        {(['all', 'open', 'closed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
              statusFilter === s ? 'bg-brand-500 text-white' : 'bg-white text-ink/60 ring-1 ring-brand-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-brand-100 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-ink/50">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center text-ink/50">No job postings yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-50/60 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Applicants</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-brand-50">
                  <td className="px-4 py-3 font-medium text-ink">
                    <Link to={`/jobs/${job.id}`} className="hover:text-brand-600">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{job.location}</td>
                  <td className="px-4 py-3 text-ink/60">{job.type}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/hr/jobs/${job.id}/applicants`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {applicantCounts[job.id] ?? 0} applicants
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        job.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/hr/jobs/${job.id}/edit`)}
                        className="rounded-md border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(job)}
                        className="rounded-md border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                      >
                        {job.status === 'open' ? 'Close' : 'Reopen'}
                      </button>
                      <button
                        onClick={() => remove(job)}
                        className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default Dashboard;
