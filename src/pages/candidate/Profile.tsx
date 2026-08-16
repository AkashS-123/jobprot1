import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    headline: user?.headline ?? '',
    location: user?.location ?? '',
    phone: user?.phone ?? '',
    experienceYears: user?.experienceYears ?? 0,
    bio: user?.bio ?? '',
    resumeUrl: user?.resumeUrl ?? '',
    skillsText: (user?.skills ?? []).join(', '),
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await refreshUser({
      name: form.name,
      headline: form.headline,
      location: form.location,
      phone: form.phone,
      experienceYears: Number(form.experienceYears) || 0,
      bio: form.bio,
      resumeUrl: form.resumeUrl,
      skills: form.skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Your profile</h1>
      <p className="mt-1 text-ink/60">Keep this up to date — HR teams review it with every application.</p>

      <form onSubmit={handleSave} className="mt-6 space-y-4 rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Full name</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Headline</label>
            <input
              value={form.headline}
              onChange={(e) => update('headline', e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Location</label>
            <input
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Years of experience</label>
            <input
              type="number"
              min={0}
              value={form.experienceYears}
              onChange={(e) => update('experienceYears', e.target.value)}
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Resume link</label>
            <input
              value={form.resumeUrl}
              onChange={(e) => update('resumeUrl', e.target.value)}
              placeholder="https://…"
              className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">Skills (comma-separated)</label>
          <input
            value={form.skillsText}
            onChange={(e) => update('skillsText', e.target.value)}
            placeholder="React, TypeScript, Node.js"
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">About you</label>
          <textarea
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {saved && <span className="text-sm text-emerald-600">Profile saved.</span>}
        </div>
      </form>
    </div>
  );
};

export default Profile;
