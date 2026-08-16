import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJobById } from '../../api/jobs';
import {
  fetchApplicationForJobAndCandidate,
  createApplication,
} from '../../api/applications';
import { fetchSavedJobs, saveJob, unsaveJob } from '../../api/savedJobs';
import { useAuth } from '../../context/AuthContext';
import type { Job, Application, SavedJob } from '../../types';
import StatusBadge from '../../components/StatusBadge';

function formatSalary(min: number, max: number) {
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  return `${fmt(min)} – ${fmt(max)} / year`;
}

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [savedJob, setSavedJob] = useState<SavedJob | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchJobById(id)
      .then(setJob)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    fetchApplicationForJobAndCandidate(id, user.id).then(setApplication);
    fetchSavedJobs(user.id).then((list) => setSavedJob(list.find((s) => s.jobId === id) ?? null));
  }, [id, user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job) return;
    if (coverLetter.trim().length < 20) {
      setError('Please write a short note (at least 20 characters) explaining your interest.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const app = await createApplication({
        jobId: job.id,
        candidateId: user.id,
        coverLetter: coverLetter.trim(),
      });
      setApplication(app);
      setShowApplyForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSave = async () => {
    if (!user || !job) return;
    if (savedJob) {
      await unsaveJob(savedJob.id);
      setSavedJob(null);
    } else {
      const created = await saveJob(user.id, job.id);
      setSavedJob(created);
    }
  };

  if (loading) return <div className="py-24 text-center text-ink/50">Loading…</div>;
  if (!job)
    return (
      <div className="py-24 text-center text-ink/50">
        Job not found. <Link to="/jobs" className="text-brand-600 underline">Back to jobs</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/jobs" className="text-sm text-brand-600 hover:underline">
        ← Back to all jobs
      </Link>

      <div className="mt-4 rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{job.title}</h1>
            <p className="mt-1 text-ink/60">
              {job.company} · {job.location}
            </p>
          </div>
          <button
            onClick={toggleSave}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              savedJob
                ? 'border-amberflag bg-amberflag/10 text-amberflag'
                : 'border-brand-200 text-brand-600 hover:border-amberflag hover:text-amberflag'
            }`}
          >
            {savedJob ? '★ Saved' : '☆ Save job'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {job.type}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink/70">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          {job.status === 'closed' && (
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
              Closed to applications
            </span>
          )}
        </div>

        <section className="mt-6">
          <h2 className="font-display text-lg font-semibold text-ink">About the role</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">
            {job.description}
          </p>
        </section>

        {job.responsibilities?.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display text-lg font-semibold text-ink">Responsibilities</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/70">
              {job.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>
        )}

        {job.requirements?.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display text-lg font-semibold text-ink">Requirements</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/70">
              {job.requirements.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>
        )}

        {job.skills?.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display text-lg font-semibold text-ink">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 border-t border-brand-100 pt-6">
          {user?.role === 'hr' ? (
            <p className="text-sm text-ink/50">
              You're viewing this posting as HR.{' '}
              <Link to={`/hr/jobs/${job.id}/applicants`} className="text-brand-600 hover:underline">
                View applicants →
              </Link>
            </p>
          ) : application ? (
            <div className="flex items-center gap-3 rounded-lg bg-brand-50 px-4 py-3">
              <span className="text-sm font-medium text-ink">You applied on {new Date(application.appliedAt).toLocaleDateString()}.</span>
              <StatusBadge status={application.status} />
            </div>
          ) : job.status === 'closed' ? (
            <p className="text-sm text-ink/50">This job is no longer accepting applications.</p>
          ) : showApplyForm ? (
            <form onSubmit={handleApply} className="space-y-3">
              <label className="block text-sm font-medium text-ink/80">
                Note to the hiring team
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                placeholder="Briefly share why you're a good fit for this role…"
                className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
              />
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit application'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="rounded-md border border-brand-200 px-4 py-2 text-sm text-ink/70 hover:bg-brand-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowApplyForm(true)}
              className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Apply for this job
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
