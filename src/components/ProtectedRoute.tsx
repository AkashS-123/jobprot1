import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

const ProtectedRoute: React.FC<{ allow: Role[]; children: React.ReactNode }> = ({
  allow,
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-brand-600">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.role)) {
    return <Navigate to={user.role === 'hr' ? '/hr' : '/jobs'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
