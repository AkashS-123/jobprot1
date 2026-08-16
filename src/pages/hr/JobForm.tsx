import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createJob, fetchJobById, updateJob } from '../../api/jobs';
import type { JobType } from '../../types';



const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

const emptyForm = {
  title: '',
  location: '',
  type: 'Full-time' as JobType,
  salaryMin: '',
  salaryMax: '',
  description: '',
  responsibilities: '',
  requirements: '',
  skills: '',
};

const JobForm: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchJobById(id).then((job) => {
      if (user && job.postedBy !== user.id) {
        setError('You can only edit jobs you posted.');
        navigate('/hr');
        return;
      }
      setForm({
        title: job.title,
        location: job.location,
        type: job.type,
        salaryMin: String(job.salaryMin),
        salaryMax: String(job.salaryMax),
        description: job.description,
        responsibilities: job.responsibilities.join('\n'),
        requirements: job.requirements.join('\n'),
        skills: job.skills.join(', '),
      });
      setLoading(false);
    });
  }, [id]);

  const update = (field: keyof typeof emptyForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    const min = Number(form.salaryMin);
    const max = Number(form.salaryMax);
    if (!form.title || !form.location || !form.description) {
      setError('Please fill in title, location, and description.');
      return;
    }
    if (min <= 0 || max <= 0 || max < min) {
      setError('Please enter a valid salary range.');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      company: user.company ?? user.name,
      location: form.location,
      type: form.type,
      salaryMin: min,
      salaryMax: max,
      description: form.description,
      responsibilities: form.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (isEdit && id) {
        await updateJob(id, payload);
      } else {
        await createJob({
          ...payload,
          status: 'open',
          postedBy: user.id,
          postedAt: new Date().toISOString(),
        });
      }
      navigate('/hr');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-24 text-center text-ink/50">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-ink">
        {isEdit ? 'Edit job posting' : 'Post a new job'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">Job title</label>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Location</label>
            <input
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="City or 'Remote'"
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Job type</label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Min salary (USD)</label>
            <input
              type="number"
              value={form.salaryMin}
              onChange={(e) => update('salaryMin', e.target.value)}
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Max salary (USD)</label>
            <input
              type="number"
              value={form.salaryMax}
              onChange={(e) => update('salaryMax', e.target.value)}
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">
            Responsibilities <span className="font-normal text-ink/40">(one per line)</span>
          </label>
          <textarea
            value={form.responsibilities}
            onChange={(e) => update('responsibilities', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">
            Requirements <span className="font-normal text-ink/40">(one per line)</span>
          </label>
          <textarea
            value={form.requirements}
            onChange={(e) => update('requirements', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">
            Skills <span className="font-normal text-ink/40">(comma-separated)</span>
          </label>
          <input
            value={form.skills}
            onChange={(e) => update('skills', e.target.value)}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish job'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/hr')}
            className="rounded-md border border-brand-200 px-5 py-2.5 text-sm text-ink/70 hover:bg-brand-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
