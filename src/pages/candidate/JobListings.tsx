import React, { useEffect, useMemo, useState } from 'react';
import { fetchJobs } from '../../api/jobs';
import { fetchSavedJobs, saveJob, unsaveJob } from '../../api/savedJobs';
import { fetchApplicationsByCandidate } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import type { Job, SavedJob, Application, JobType } from '../../types';
import JobCard from '../../components/JobCard';
import Pagination from '../../components/Pagination';

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const PAGE_SIZE = 6;

const JobListings: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [page, setPage] = useState(1);

  // debounce search text
  const [debouncedQ, setDebouncedQ] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, location, type, salaryMin]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchJobs({
      q: debouncedQ || undefined,
      location: location || undefined,
      type: type || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      status: 'open',
      _page: page,
      _limit: PAGE_SIZE,
    })
      .then((res) => {
        if (!active) return;
        setJobs(res.jobs);
        setTotal(res.total);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debouncedQ, location, type, salaryMin, page]);

  useEffect(() => {
    if (!user) return;
    fetchSavedJobs(user.id).then(setSavedJobs);
    fetchApplicationsByCandidate(user.id).then(setApplications);
  }, [user]);

  const savedJobIds = useMemo(() => new Set(savedJobs.map((s) => s.jobId)), [savedJobs]);
  const appliedJobIds = useMemo(() => new Set(applications.map((a) => a.jobId)), [applications]);

  const toggleSave = async (jobId: string) => {
    if (!user) return;
    const existing = savedJobs.find((s) => s.jobId === jobId);
    if (existing) {
      await unsaveJob(existing.id);
      setSavedJobs((prev) => prev.filter((s) => s.id !== existing.id));
    } else {
      const created = await saveJob(user.id, jobId);
      setSavedJobs((prev) => [...prev, created]);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const clearFilters = () => {
    setQ('');
    setLocation('');
    setType('');
    setSalaryMin('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">Find your next role</h1>
        <p className="mt-1 text-ink/60">{total} open positions matching your criteria.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-brand-100 bg-white p-4 shadow-sm md:grid-cols-12">
        <div className="md:col-span-4">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50">
            Search
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Job title, company, or keyword"
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          />
        </div>
        <div className="md:col-span-3">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50">
            Location
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or 'Remote'"
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50">
            Job type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          >
            <option value="">Any</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50">
            Min salary
          </label>
          <select
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          >
            <option value="">Any</option>
            <option value="50000">$50k+</option>
            <option value="80000">$80k+</option>
            <option value="110000">$110k+</option>
            <option value="150000">$150k+</option>
          </select>
        </div>
        <div className="flex items-end md:col-span-1">
          <button
            onClick={clearFilters}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm text-brand-700 hover:bg-brand-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="py-16 text-center text-ink/50">Loading jobs…</div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-200 py-16 text-center text-ink/50">
            No jobs match your filters. Try widening your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedJobIds.has(job.id)}
                applied={appliedJobIds.has(job.id)}
                onToggleSave={() => toggleSave(job.id)}
              />
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default JobListings;
