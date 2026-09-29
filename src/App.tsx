/**
 * src/App.tsx — Main Application Entry Point with React Router & AuthProvider.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DemoSwitcher } from './components/DemoSwitcher';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { NgosPage } from './pages/NgosPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardRouter } from './pages/DashboardRouter';
import { HelpPage } from './pages/HelpPage';
import { NotificationsPage } from './pages/NotificationsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          <DemoSwitcher />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/ngos" element={<NgosPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
