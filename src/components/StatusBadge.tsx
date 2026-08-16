import React from 'react';
import type { ApplicationStatus } from '../types';
import { STATUS_LABELS } from '../types';

const COLORS: Record<ApplicationStatus, string> = {
  applied: 'bg-slate-100 text-slate-700 ring-slate-300',
  under_review: 'bg-amber-50 text-amber-700 ring-amber-300',
  shortlisted: 'bg-brand-50 text-brand-700 ring-brand-300',
  interview: 'bg-sky-50 text-sky-700 ring-sky-300',
  offered: 'bg-emerald-50 text-emerald-700 ring-emerald-300',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-300',
};

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${COLORS[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

export default StatusBadge;
