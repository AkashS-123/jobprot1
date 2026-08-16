import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive ? 'bg-brand-500 text-white' : 'text-ink/70 hover:text-brand-600 hover:bg-brand-50'
  }`;

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-brand-100 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="font-display text-xl font-semibold text-brand-700">
            Fieldnote
          </NavLink>
          {user?.role === 'candidate' && (
            <nav className="hidden gap-1 md:flex">
              <NavLink to="/jobs" className={linkClass}>
                Browse jobs
              </NavLink>
              <NavLink to="/applications" className={linkClass}>
                My applications
              </NavLink>
              <NavLink to="/saved" className={linkClass}>
                Saved jobs
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>
            </nav>
          )}
          {user?.role === 'hr' && (
            <nav className="hidden gap-1 md:flex">
              <NavLink to="/hr" end className={linkClass}>
                Postings
              </NavLink>
              <NavLink to="/hr/pipeline" className={linkClass}>
                Pipeline
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-ink">{user.name}</p>
                <p className="text-xs uppercase tracking-wide text-brand-500">
                  {user.role === 'hr' ? 'HR' : 'Candidate'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
