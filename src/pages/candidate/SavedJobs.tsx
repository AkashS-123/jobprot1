import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchSavedJobs, unsaveJob } from '../../api/savedJobs';
import { fetchJobById } from '../../api/jobs';
import type { SavedJob, Job } from '../../types';
import JobCard from '../../components/JobCard';

const SavedJobs: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<{ saved: SavedJob; job: Job }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const saved = await fetchSavedJobs(user.id);
    const jobs = await Promise.all(saved.map((s) => fetchJobById(s.jobId)));
    setRows(saved.map((s, i) => ({ saved: s, job: jobs[i] })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUnsave = async (savedId: string) => {
    await unsaveJob(savedId);
    setRows((prev) => prev.filter((r) => r.saved.id !== savedId));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Saved jobs</h1>
      <p className="mt-1 text-ink/60">Roles you've bookmarked for later.</p>

      <div className="mt-6">
        {loading ? (
          <div className="py-16 text-center text-ink/50">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-200 py-16 text-center text-ink/50">
            No saved jobs yet.{' '}
            <Link to="/jobs" className="text-brand-600 underline">
              Browse open roles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ saved, job }) => (
              <JobCard key={saved.id} job={job} saved onToggleSave={() => handleUnsave(saved.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
