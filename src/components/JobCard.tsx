import React from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../types';

function formatSalary(min: number, max: number) {
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  return `${fmt(min)} – ${fmt(max)}`;
}

const JobCard: React.FC<{
  job: Job;
  saved?: boolean;
  onToggleSave?: () => void;
  applied?: boolean;
}> = ({ job, saved, onToggleSave, applied }) => {
  return (
    <div className="group rounded-xl border border-brand-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/jobs/${job.id}`} className="font-display text-lg font-semibold text-ink hover:text-brand-600">
            {job.title}
          </Link>
          <p className="mt-0.5 text-sm text-ink/60">
            {job.company} · {job.location}
          </p>
        </div>
        {onToggleSave && (
          <button
            onClick={onToggleSave}
            aria-label={saved ? 'Unsave job' : 'Save job'}
            className={`shrink-0 rounded-full border p-2 text-sm transition ${
              saved
                ? 'border-amberflag bg-amberflag/10 text-amberflag'
                : 'border-brand-200 text-brand-400 hover:text-amberflag hover:border-amberflag'
            }`}
          >
            {saved ? '★' : '☆'}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
          {job.type}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-ink/70">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
        {job.status === 'closed' && (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
            Closed
          </span>
        )}
        {applied && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
            Applied
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-ink/60">{job.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-ink/40">
          Posted {new Date(job.postedAt).toLocaleDateString()}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="text-sm font-semibold text-brand-600 group-hover:underline"
        >
          View details →
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
