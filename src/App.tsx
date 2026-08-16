import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';

import JobListings from './pages/candidate/JobListings';
import JobDetails from './pages/candidate/JobDetails';
import Applications from './pages/candidate/Applications';
import SavedJobs from './pages/candidate/SavedJobs';
import Profile from './pages/candidate/Profile';

import Dashboard from './pages/hr/Dashboard';
import JobForm from './pages/hr/JobForm';
import Applicants from './pages/hr/Applicants';
import CandidateProfile from './pages/hr/CandidateProfile';
import Pipeline from './pages/hr/Pipeline';

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-24 text-center text-ink/50">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'hr' ? '/hr' : '/jobs'} replace />;
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Candidate-only routes */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute allow={['candidate']}>
                <JobListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute allow={['candidate', 'hr']}>
                <JobDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute allow={['candidate']}>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute allow={['candidate']}>
                <SavedJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allow={['candidate']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* HR-only routes */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute allow={['hr']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/jobs/new"
            element={
              <ProtectedRoute allow={['hr']}>
                <JobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/jobs/:id/edit"
            element={
              <ProtectedRoute allow={['hr']}>
                <JobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/jobs/:jobId/applicants"
            element={
              <ProtectedRoute allow={['hr']}>
                <Applicants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/candidates/:id"
            element={
              <ProtectedRoute allow={['hr']}>
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/pipeline"
            element={
              <ProtectedRoute allow={['hr']}>
                <Pipeline />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
