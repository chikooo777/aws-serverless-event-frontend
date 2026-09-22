import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

// Component Imports
import DeveloperProfile from './components/DeveloperProfile';
import ArchitectureBanner from './components/ArchitectureBanner';
import JobIngestionPlayground from './components/JobIngestionPlayground';
import JobTable from './components/JobTable';
import GlassBackground from './components/GlassBackground';
import { INITIAL_JOBS } from './utils/mockData';

// Icons
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  LogOut,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  Sparkles,
  Server
} from 'lucide-react';

// Configure Amplify with Cognito User Pool
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

// Custom Header Component injected into Amplify Authenticator
const authenticatorComponents = {
  Header() {
    return (
      <div className="auth-custom-header">
        <div className="auth-custom-header-badge">
          <span className="auth-pulse-dot" />
          <span>Cloud Ingress Terminal</span>
        </div>
        <h2 className="auth-custom-header-title">Welcome to the Platform</h2>
        <p className="auth-custom-header-subtitle">
          Sign in to access your high-throughput serverless event streaming console
        </p>
      </div>
    );
  }
};

/**
 * Main Application View
 * Transitions smoothly between the creative showcase split-screen authentication
 * and the authenticated live Mission Control dashboard.
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
  // VIEW 1: CREATIVE SHOWCASE & AUTHENTICATOR (Unauthenticated State)
  // =========================================================================
  if (authStatus !== 'authenticated') {
    return (
      <div className="auth-wrapper">
        {/* 1. Background & Floating Animated Cloud Orbs */}
        <div className="auth-bg-orbs" aria-hidden="true">
          <div className="cloud-orb cloud-orb-1" />
          <div className="cloud-orb cloud-orb-2" />
          <div className="cloud-orb cloud-orb-3" />
          <div className="cloud-orb cloud-orb-4" />
          <div className="auth-grid-texture" />
        </div>

        {/* 2. Glassmorphic Split-Screen Card */}
        <div className="auth-split-card">
          {/* Left Panel: Creative Showcase */}
          <div className="auth-left-showcase">
            <div>
              {/* Profile Image & Developer Name */}
              <div className="auth-profile-wrap">
                <div className="auth-profile-avatar-container">
                  <img
                    src="/profile.png"
                    alt="Durvesh Raysing"
                    className="auth-profile-img"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.retried) {
                        e.currentTarget.dataset.retried = 'true';
                        e.currentTarget.src = './profile.png';
                      } else {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.auth-avatar-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="auth-avatar-fallback" style={{ display: 'none' }}>
                    DR
                  </div>
                </div>

                <div>
                  <span className="auth-developer-tag">
                    <Sparkles size={12} color="#ff9900" />
                    <span>Lead Cloud Architect</span>
                  </span>
                  <h1 className="auth-developer-name">Durvesh Raysing</h1>
                </div>
              </div>

              {/* Application Title & Mission Statement */}
              <div className="auth-app-hero">
                <h2 className="auth-app-title">Serverless Event-Driven Processing Engine</h2>
                <p className="auth-app-desc">
                  High-throughput, asynchronous event orchestration designed for real-time cloud telemetry, automated queue-based buffering, and fault-tolerant DynamoDB persistence.
                </p>
              </div>

              {/* Architecture Core Summary */}
              <div className="auth-arch-summary-box">
                <div className="auth-arch-label">
                  <Cpu size={14} />
                  <span>Architecture Core</span>
                </div>
                <div className="auth-arch-text">
                  Powered by AWS Lambda, SQS, Cognito & DynamoDB
                </div>
              </div>

              {/* Service Feature Tags */}
              <div className="auth-tags-grid">
                <span className="auth-tag-pill">
                  <Zap size={11} color="#ff9900" /> Lambda Function URL
                </span>
                <span className="auth-tag-pill">
                  <Layers size={11} color="#2dd4e8" /> SQS FIFO Queue
                </span>
                <span className="auth-tag-pill">
                  <ShieldCheck size={11} color="#a855f7" /> Amazon Cognito JWT
                </span>
                <span className="auth-tag-pill">
                  <Database size={11} color="#3ecf8e" /> DynamoDB Single-Table
                </span>
                <span className="auth-tag-pill">
                  <Server size={11} color="#ffad33" /> Zero Cold-Start Bus
                </span>
              </div>
            </div>

            {/* Showcase Status Footer */}
            <div className="auth-showcase-footer">
              <span className="auth-status-online">
                <span className="auth-pulse-dot" />
                <span>Production Ingress Live</span>
              </span>
              <span>Region: ap-south-1</span>
            </div>
          </div>

          {/* Right Panel: Amplify Authenticator */}
          <div className="auth-right-panel">
            <Authenticator components={authenticatorComponents} />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED SERVERLESS EVENT CONSOLE (Authenticated State)
  // =========================================================================
  return (
    <div className="app-container">
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

      {/* Main Mission Control Content */}
      <main className="main-content">
        <DeveloperProfile />
        <ArchitectureBanner pulseKey={pulseKey} />

        <div className="dashboard-grid">
          {/* Ingestion Playground */}
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

          {/* Right: Latest Ingress Status + Job Ledger Table */}
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

      {/* Global Reactive Toast Stack */}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={16} color="var(--mint)" />}
            {toast.type === 'error' && <AlertCircle size={16} color="var(--coral)" />}
            {toast.type === 'info' && <Info size={16} color="var(--cyan)" />}
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
