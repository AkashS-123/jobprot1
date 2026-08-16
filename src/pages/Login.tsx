import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Something went wrong.');
      return;
    }
    const dest = (location.state as any)?.from ?? '/';
    navigate(dest, { replace: true });
  };

  const fillDemo = (role: 'candidate' | 'hr') => {
    if (role === 'candidate') {
      setEmail('ava.candidate@example.com');
      setPassword('password123');
    } else {
      setEmail('rhea.hr@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/60">Log in to your Fieldnote account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/80">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="mt-4 flex justify-center gap-3 text-xs text-ink/50">
        <button onClick={() => fillDemo('candidate')} className="underline hover:text-brand-600">
          Use demo candidate
        </button>
        <span>·</span>
        <button onClick={() => fillDemo('hr')} className="underline hover:text-brand-600">
          Use demo HR
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-ink/60">
        No account yet?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
