import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

// Component Imports
import DeveloperProfile from './components/DeveloperProfile';
import ArchitectureBanner from './components/ArchitectureBanner';
import JobTable from './components/JobTable';
import { INITIAL_JOBS, SAMPLE_PAYLOADS } from './utils/mockData';

// Icons
import { 
  Cloud, 
  Globe, 
  Send, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  FileCode, 
  Cpu, 
  Zap, 
  LogOut,
  Layers,
  TrendingUp,
  Clock
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
  // Ingestion Payload state
  const defaultPayload = JSON.stringify(SAMPLE_PAYLOADS.ORDER_PROCESSING.payload, null, 2);
  const [payload, setPayload] = useState(defaultPayload);
  const [priority, setPriority] = useState('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Real-time Reactive Feedback State
  const [lastSubmission, setLastSubmission] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'success' | 'error' | 'info'

  // Job History Pipeline State
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Helper: Load Sample JSON Template
  const loadSample = (templateKey) => {
    if (SAMPLE_PAYLOADS[templateKey]) {
      const formatted = JSON.stringify(SAMPLE_PAYLOADS[templateKey].payload, null, 2);
      setPayload(formatted);
      setStatusMessage(`Loaded template: ${SAMPLE_PAYLOADS[templateKey].name}`);
      setStatusType('info');
      addToast(`Loaded template: ${SAMPLE_PAYLOADS[templateKey].name}`, 'info');
    }
  };

  // Helper: Prettify JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(payload);
      setPayload(JSON.stringify(parsed, null, 2));
      setStatusMessage('JSON structure validated and formatted.');
      setStatusType('success');
      addToast('JSON formatted successfully', 'info');
    } catch (err) {
      setStatusMessage(`Invalid JSON: ${err.message}`);
      setStatusType('error');
      addToast(`JSON syntax error: ${err.message}`, 'error');
    }
  };

  // 2. Submit Processing Job via Lambda Function URL with JWT Bearer Token
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payload);
    } catch (err) {
      setStatusMessage(`Cannot submit invalid JSON structure: ${err.message}`);
      setStatusType('error');
      addToast('Invalid JSON structure', 'error');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Dispatching payload to AWS Lambda Function URL...');
    setStatusType('info');

    const startTime = performance.now();

    try {
      // Fetch secure Cognito JWT ID Token
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      // Secure HTTP POST call with Bearer Token
      const response = await fetch(LAMBDA_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          data: payload,
          payload: parsedPayload,
          priority,
          submittedAt: new Date().toISOString()
        })
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        let result = {};
        try {
          result = await response.json();
        } catch {
          result = { message: 'Event successfully accepted by Lambda Function URL' };
        }

        const jobId = result.jobId || result.id || `job-${crypto.randomUUID()}`;
        const message = result.message || 'Job queued for asynchronous processing in SQS';

        const successText = `Success: ${message} (Job ID: ${jobId.slice(0, 18)}...)`;
        setStatusMessage(successText);
        setStatusType('success');
        addToast(successText, 'success');

        const newJob = {
          jobId,
          eventType: parsedPayload.eventType || parsedPayload.detailType || 'OrderFulfillment',
          status: 'COMPLETED',
          timestamp: new Date().toLocaleString(),
          latencyMs,
          payload: parsedPayload,
          message
        };

        setLastSubmission(newJob);
        setJobs((prev) => [newJob, ...prev]);

      } else {
        const errorBody = await response.text().catch(() => '');
        const errText = `AWS Lambda Invocation Error (${response.status}): ${errorBody || response.statusText}`;
        setStatusMessage(errText);
        setStatusType('error');
        addToast(errText, 'error');

        setLastSubmission({
          jobId: `err-${crypto.randomUUID().slice(0, 8)}`,
          eventType: parsedPayload.eventType || 'FailedIngress',
          status: 'FAILED',
          timestamp: new Date().toLocaleString(),
          latencyMs,
          payload: parsedPayload,
          message: errText
        });
      }
    } catch (error) {
      console.error('Job submission failed:', error);
      const failText = `Network/Endpoint Error: ${error.message}`;
      setStatusMessage(failText);
      setStatusType('error');
      addToast(failText, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Wrap application in Authenticator with Glassmorphism styling
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app-container">
          {/* Frosted Glass Topbar */}
          <header className="navbar-glass">
            <div className="nav-wrapper">
              <div className="brand-wrap">
                <div className="brand-icon-glass">
                  <Zap size={22} />
                </div>
                <div>
                  <div className="brand-title">AWS Serverless Event Console</div>
                  <div className="brand-sub">
                    <span>Decoupled SQS + Lambda + DynamoDB Pipeline</span>
                  </div>
                </div>
              </div>

              <div className="nav-actions">
                <div className="region-pill">
                  <span className="pulse-dot-green"></span>
                  <span>ap-south-1</span>
                </div>

                <div className="user-glass-pill">
                  <span className="user-email-text">
                    {user?.signInDetails?.loginId || user?.username || 'durveshraysing43@gmail.com'}
                  </span>
                  <button 
                    onClick={signOut} 
                    className="btn-glass btn-glass-danger"
                    title="Sign Out of Amazon Cognito Session"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Glass Workspace */}
          <main className="main-content">
            {/* Header & Developer Profile Card */}
            <DeveloperProfile />

            {/* Decoupled Architecture Flow Visualizer */}
            <ArchitectureBanner />

            {/* Two-Column Grid: Ingestion Playground + Status Visualizer */}
            <div className="dashboard-grid">
              {/* Left Column: Ingestion Playground Card */}
              <section className="glass-panel ingestion-card" aria-label="Ingestion Playground">
                <div className="card-title-wrap">
                  <h2 className="card-title">
                    <Cpu size={20} color="var(--aws-amber)" />
                    <span>Job Ingestion Playground</span>
                  </h2>
                  <p className="card-sub">
                    Direct HTTPS payload ingress via secure Lambda Function URL
                  </p>
                </div>

                {/* Target Endpoint Indicator */}
                <div className="endpoint-glass-banner">
                  <div className="endpoint-banner-title">
                    <Globe size={13} />
                    <span>Target Lambda Function URL Endpoint:</span>
                  </div>
                  <div className="endpoint-url-code">
                    POST {LAMBDA_FUNCTION_URL}
                  </div>
                </div>

                {/* Template Quick Selectors */}
                <div className="form-group">
                  <div className="form-label-row">
                    <span>Quick Event Templates</span>
                    <div className="template-chips">
                      <button 
                        type="button" 
                        className="glass-chip" 
                        onClick={() => loadSample('ORDER_PROCESSING')}
                      >
                        Order Event (SQS FIFO)
                      </button>
                      <button 
                        type="button" 
                        className="glass-chip" 
                        onClick={() => loadSample('IMAGE_RESIZE')}
                      >
                        S3 Pipeline
                      </button>
                      <button 
                        type="button" 
                        className="glass-chip" 
                        onClick={() => loadSample('IOT_TELEMETRY')}
                      >
                        IoT Device
                      </button>
                    </div>
                  </div>
                </div>

                {/* Frosted JSON Editor */}
                <div className="form-group">
                  <div className="form-label-row">
                    <span>Event Payload (JSON)</span>
                    <button 
                      type="button" 
                      className="glass-chip" 
                      onClick={formatJson}
                    >
                      <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
                      Prettify JSON
                    </button>
                  </div>

                  <div className="editor-glass-container">
                    <textarea 
                      rows="9" 
                      className="frosted-textarea"
                      placeholder="Paste JSON payload here..."
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      spellCheck="false"
                    />
                    <div className="editor-footer-glass">
                      <span>UTF-8 Monospace</span>
                      <span>{new Blob([payload]).size} bytes</span>
                    </div>
                  </div>
                </div>

                {/* Glowing Submit Button */}
                <button 
                  id="submit-job-btn"
                  onClick={handleSubmit}
                  className="btn-glow-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="spin-icon" />
                      <span>Transmitting to Lambda Function URL...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Processing Job</span>
                    </>
                  )}
                </button>

                {/* Reactive Status Feedback Card */}
                {statusMessage && (
                  <div className={`status-feedback-box ${statusType}`}>
                    {statusType === 'success' && <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                    {statusType === 'error' && <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                    {statusType === 'info' && <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                    <div>{statusMessage}</div>
                  </div>
                )}
              </section>

              {/* Right Column: Reactive Pipeline Status & Table */}
              <section aria-label="Job Processing Status Visualizer">
                {/* Last Ingress Quick Card */}
                {lastSubmission && (
                  <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                        Latest Ingress Response
                      </span>
                      <span className={`neon-badge ${lastSubmission.status.toLowerCase()}`}>
                        <span className="neon-dot"></span>
                        {lastSubmission.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--aws-cyan)' }}>
                        UUID: {lastSubmission.jobId}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Latency: {lastSubmission.latencyMs} ms
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Execution Table */}
                <JobTable jobs={jobs} addToast={addToast} />
              </section>
            </div>
          </main>

          {/* Floating Glass Toasts */}
          <div className="toast-glass-container" aria-live="polite">
            {toasts.map((toast) => (
              <div key={toast.id} className={`toast-glass ${toast.type}`}>
                {toast.type === 'success' && <CheckCircle2 size={16} color="var(--status-completed)" />}
                {toast.type === 'error' && <AlertCircle size={16} color="var(--status-failed)" />}
                {toast.type === 'info' && <Info size={16} color="var(--aws-cyan)" />}
                <span>{toast.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Authenticator>
  );
}
