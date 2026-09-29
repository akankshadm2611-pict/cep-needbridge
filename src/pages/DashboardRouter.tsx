/**
 * src/pages/DashboardRouter.tsx — Routes authenticated users to their role-specific dashboard.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VolunteerDashboard } from './dashboards/VolunteerDashboard';
import { NgoDashboard } from './dashboards/NgoDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

export function DashboardRouter() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (!user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'ngo') {
    return <NgoDashboard />;
  }

  return <VolunteerDashboard />;
}
