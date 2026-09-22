import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

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
} from 'lucide-react';

// 1. Configure Amplify with Cognito User Pool
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});

const LAMBDA_FUNCTION_URL = import.meta.env.VITE_LAMBDA_FUNCTION_URL || 'https://xvctobmuszfdur5l2tvyve5j5e0hzdtw.lambda-url.ap-south-1.on.aws/';

export default function App() {
  // Real-time Reactive Feedback State
  const [lastSubmission, setLastSubmission] = useState(null);

  // Job History Pipeline State
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [toasts, setToasts] = useState([]);

  // Drives the traveling-packet animation on the pipeline trace; bumped on every submit
  const [pulseKey, setPulseKey] = useState(0);

  // Toast Helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 3. Wrap application in Authenticator
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app-container">
          <GlassBackground />
          {/* Top rail */}
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
                  <span className="pulse-dot"></span>
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

          <main className="main-content">
            <DeveloperProfile />

            <ArchitectureBanner pulseKey={pulseKey} />

            <div className="dashboard-grid">
              {/* Left: Ingestion Playground */}
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

              {/* Right: Latest ingress + job ledger */}
              <section aria-label="Job Processing Status Visualizer">
                {lastSubmission && (
                  <div className="panel latest-card">
                    <div className="latest-card-head">
                      <span className="latest-card-label">Latest ingress response</span>
                      <span className={`status-badge ${lastSubmission.status.toLowerCase()}`}>
                        <span className="dot"></span>
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
      )}
    </Authenticator>
  );
}
