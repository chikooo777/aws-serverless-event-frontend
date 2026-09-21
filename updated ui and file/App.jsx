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
  Globe,
  Send,
  RefreshCw,
  Sparkles,
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
    setPulseKey((k) => k + 1);

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

  // 3. Wrap application in Authenticator
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app-container">
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
              <section className="panel" aria-label="Ingestion Playground">
                <div className="section-head">
                  <h2 className="section-title">
                    <Send size={17} color="var(--amber)" />
                    <span>Ingestion playground</span>
                  </h2>
                  <p className="section-sub">Send a payload straight to the live Lambda Function URL</p>
                </div>

                <div className="ingestion-body">
                  <div className="endpoint-strip">
                    <div className="endpoint-strip-label">
                      <Globe size={12} />
                      <span>Target endpoint</span>
                    </div>
                    <div className="endpoint-strip-url">POST {LAMBDA_FUNCTION_URL}</div>
                  </div>

                  <div>
                    <div className="field-label-row">
                      <span className="field-label">Quick templates</span>
                      <div className="template-chips">
                        <button type="button" className="chip" onClick={() => loadSample('ORDER_PROCESSING')}>
                          Order event
                        </button>
                        <button type="button" className="chip" onClick={() => loadSample('IMAGE_RESIZE')}>
                          S3 pipeline
                        </button>
                        <button type="button" className="chip" onClick={() => loadSample('IOT_TELEMETRY')}>
                          IoT device
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="field-label-row">
                      <span className="field-label">Event payload (JSON)</span>
                      <button type="button" className="chip" onClick={formatJson}>
                        <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} />
                        Format
                      </button>
                    </div>

                    <div className="editor-shell">
                      <textarea
                        rows="9"
                        className="editor-textarea"
                        placeholder="Paste JSON payload here..."
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        spellCheck="false"
                      />
                      <div className="editor-footer">
                        <span>UTF-8</span>
                        <span>{new Blob([payload]).size} bytes</span>
                      </div>
                    </div>
                  </div>

                  <button id="submit-job-btn" onClick={handleSubmit} className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={17} className="spin" />
                        <span>Sending to Lambda...</span>
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        <span>Send event</span>
                      </>
                    )}
                  </button>

                  {statusMessage && (
                    <div className={`status-box ${statusType}`}>
                      {statusType === 'success' && <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                      {statusType === 'error' && <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                      {statusType === 'info' && <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                      <div>{statusMessage}</div>
                    </div>
                  )}
                </div>
              </section>

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
