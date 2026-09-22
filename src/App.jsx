import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Component Imports
import DeveloperProfile from './components/DeveloperProfile';
import ArchitectureBanner from './components/ArchitectureBanner';
import JobIngestionPlayground from './components/JobIngestionPlayground';
import JobTable from './components/JobTable';
import GlassBackground from './components/GlassBackground';
import { INITIAL_JOBS } from './utils/mockData';

// Icons (Using Dark Slate monochromatic palette)
import {
  Zap,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

// Configure Amplify with AWS Cognito User Pool
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});

const LAMBDA_FUNCTION_URL =
  import.meta.env.VITE_LAMBDA_FUNCTION_URL ||
  'https://xvctobmuszfdur5l2tvyve5j5e0hzdtw.lambda-url.ap-south-1.on.aws/';

/**
 * Main Application View
 * Handles state transitions between the centralized minimal Authenticator view
 * and the authenticated heavy glassmorphic event streaming dashboard.
 */
function MainContent() {
  const { authStatus, user, signOut } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);

  // Dashboard Reactive Feedback State
  const [lastSubmission, setLastSubmission] = useState(null);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [toasts, setToasts] = useState([]);
  const [pulseKey, setPulseKey] = useState(0);

  // Toast Notifier
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // =========================================================================
  // PART 1: CENTRALIZED MINIMAL AUTHENTICATOR VIEW (Unauthenticated State)
  // Strict two-color palette, heavily rounded corners, perfectly responsive
  // =========================================================================
  const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview=dashboard');

  if (authStatus !== 'authenticated' && !isPreview) {
    return (
      <div className="auth-central-viewport">
        {/* Soft Ambient Pearl Backdrop */}
        <GlassBackground />

        {/* Centralized Frosted Glass Login Card */}
        <div className="auth-central-card">
          <div className="auth-card-header">
            <div className="auth-card-icon-wrap" aria-hidden="true">
              <Zap size={24} />
            </div>
            <h1 className="auth-card-title">Serverless Event Console</h1>
            <p className="auth-card-sub">
              Sign in to access your cloud event ingress pipeline and real-time execution ledger
            </p>
          </div>

          {/* Amplify Authenticator Component with Strict Two-Color Design Overrides */}
          <Authenticator />
        </div>
      </div>
    );
  }

  // =========================================================================
  // PART 2: MAIN DASHBOARD (Heavy Glassmorphism, Authenticated State)
  // Frosted glass panels, Dark Slate lines & typography, ample breathing space
  // =========================================================================
  return (
    <div className="app-container">
      {/* Ambient Pearl Misty Canvas */}
      <GlassBackground />

      {/* Top Rail Navbar */}
      <header className="navbar">
        <div className="nav-wrapper">
          <div className="brand-wrap">
            <div className="brand-icon">
              <Zap size={18} />
            </div>
            <div>
              <div className="brand-title">Serverless Event Console</div>
              <div className="brand-sub">SQS · Lambda · DynamoDB</div>
            </div>
          </div>

          <div className="nav-actions">
            <div className="region-pill">
              <span className="pulse-dot" />
              <span>ap-south-1</span>
            </div>

            <div className="user-pill">
              <span className="user-email">
                {user?.signInDetails?.loginId || user?.username || 'durveshraysing43@gmail.com'}
              </span>
              <button onClick={signOut} className="btn btn-danger" title="Sign out">
                <LogOut size={13} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout with Fixed Vertical Event Pipeline Sidebar */}
      <div className="dashboard-layout-container">
        {/* Left Side: Fixed/Sticky Vertical Event Pipeline Side Menu */}
        <aside className="pipeline-sidebar-wrapper">
          <ArchitectureBanner pulseKey={pulseKey} />
        </aside>

        {/* Right Side: Main Scrollable Content */}
        <main className="dashboard-main-scrollable">
          {/* Lead Cloud Architect Developer Profile */}
          <DeveloperProfile />

          {/* Core Operational Grid (Ingestion Playground + Job Ledger) */}
          <div className="dashboard-grid">
            {/* Ingestion Playground (Event Submission Area) */}
            <JobIngestionPlayground
              onJobCreated={(newJob) => {
                setLastSubmission(newJob);
                setJobs((prev) => [newJob, ...prev]);
              }}
              onJobFailed={(failedJob) => {
                setLastSubmission(failedJob);
              }}
              addToast={addToast}
              setPulseKey={setPulseKey}
              endpointUrl={LAMBDA_FUNCTION_URL}
            />

            {/* Job Processing Status Visualizer & Job Ledger */}
            <section aria-label="Job Processing Status Visualizer">
              {lastSubmission && (
                <div className="panel latest-card">
                  <div className="latest-card-head">
                    <span className="latest-card-label">Latest ingress response</span>
                    <span className={`status-badge ${lastSubmission.status.toLowerCase()}`}>
                      <span className="dot" />
                      {lastSubmission.status}
                    </span>
                  </div>
                  <div className="latest-card-row">
                    <div className="latest-uuid">{lastSubmission.jobId}</div>
                    <div className="latest-latency">{lastSubmission.latencyMs} ms</div>
                  </div>
                </div>
              )}
              <JobTable jobs={jobs} addToast={addToast} />
            </section>
          </div>
        </main>
      </div>

      {/* Global Toast Notification Stack */}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Root Application Component wrapped in Authenticator.Provider
 */
export default function App() {
  return (
    <Authenticator.Provider>
      <MainContent />
    </Authenticator.Provider>
  );
}
