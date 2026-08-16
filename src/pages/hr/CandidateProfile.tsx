import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchUserById } from '../../api/users';
import { fetchApplicationsByCandidate } from '../../api/applications';
import { fetchJobById } from '../../api/jobs';
import type { User, Application, Job } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const CandidateProfile: React.FC = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<User | null>(null);
  const [history, setHistory] = useState<{ application: Application; job: Job }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchUserById(id), fetchApplicationsByCandidate(id)]).then(async ([user, apps]) => {
      setCandidate(user);
      const jobs = await Promise.all(apps.map((a) => fetchJobById(a.jobId)));
      setHistory(apps.map((a, i) => ({ application: a, job: jobs[i] })));
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="py-24 text-center text-ink/50">Loading…</div>;
  if (!candidate) return <div className="py-24 text-center text-ink/50">Candidate not found.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/hr" className="text-sm text-brand-600 hover:underline">
        ← Back to postings
      </Link>

      <div className="mt-4 rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">{candidate.name}</h1>
        <p className="text-ink/60">
          {candidate.headline ?? 'No headline provided'} · {candidate.location ?? '—'}
        </p>
        <p className="mt-1 text-sm text-ink/50">
          {candidate.email} {candidate.phone && `· ${candidate.phone}`}
        </p>

        {candidate.bio && <p className="mt-4 text-sm leading-relaxed text-ink/70">{candidate.bio}</p>}

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40">Experience</p>
            <p className="mt-0.5 font-medium text-ink">{candidate.experienceYears ?? 0} years</p>
          </div>
          {candidate.resumeUrl && (
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/40">Resume</p>
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-block font-medium text-brand-600 hover:underline"
              >
                View resume ↗
              </a>
            </div>
          )}
        </div>

        {(candidate.skills ?? []).length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-ink/40">Skills</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(candidate.skills ?? []).map((s) => (
                <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold text-ink">Application history</h2>
        <div className="mt-3 space-y-2">
          {history.map(({ application, job }) => (
            <div
              key={application.id}
              className="flex items-center justify-between rounded-lg border border-brand-100 bg-white px-4 py-3"
            >
              <div>
                <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-ink hover:text-brand-600">
                  {job.title}
                </Link>
                <p className="text-xs text-ink/40">{job.company}</p>
              </div>
              <StatusBadge status={application.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
