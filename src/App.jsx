import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import ArchitectureBanner from './components/ArchitectureBanner';
import JobTable from './components/JobTable';
import { INITIAL_JOBS, SAMPLE_PAYLOADS } from './utils/mockData';
import { Sparkles, Send, RefreshCw, Database, Layers, Globe } from 'lucide-react';

// 1. Configure Amplify with your Cognito environment variables
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});

const LAMBDA_URL = 'https://xvctobmuszfdur5l2tvyve5j5e0hzdtw.lambda-url.ap-south-1.on.aws/';

export default function App() {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_PAYLOADS.ORDER_PROCESSING.payload, null, 2));
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Helper to load sample payloads quickly
  const loadSample = (sampleKey) => {
    if (SAMPLE_PAYLOADS[sampleKey]) {
      setPayload(JSON.stringify(SAMPLE_PAYLOADS[sampleKey].payload, null, 2));
      setStatus(`Loaded template: ${SAMPLE_PAYLOADS[sampleKey].name}`);
    }
  };

  // Prettify JSON helper
  const formatJson = () => {
    try {
      const parsed = JSON.parse(payload);
      setPayload(JSON.stringify(parsed, null, 2));
      setStatus('JSON formatted cleanly');
    } catch (err) {
      setStatus(`JSON syntax error: ${err.message}`);
    }
  };

  // 2. The submit function that securely calls your Lambda URL
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setStatus('Sending request to AWS Lambda...');

      // Grab the secure JWT token from the logged-in user
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      let parsedPayload = payload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        // allow raw string if not JSON
      }

      const startTime = performance.now();

      // Send the request with the token in the Authorization header
      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          data: payload,
          payload: parsedPayload,
          submittedAt: new Date().toISOString()
        })
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        let result = {};
        try {
          result = await response.json();
        } catch {
          result = { message: 'Processed successfully' };
        }

        const jobId = result.jobId || result.id || `job-${crypto.randomUUID()}`;
        const message = result.message || 'Job accepted into processing pipeline';
        const successStatus = `Success: ${message} (Job ID: ${jobId})`;
        setStatus(successStatus);
        addToast(successStatus, 'success');

        // Add submitted job to live Job Status Table
        const newJob = {
          jobId,
          eventType: typeof parsedPayload === 'object' ? (parsedPayload.eventType || parsedPayload.detailType || 'DataProcessing') : 'DataProcessing',
          status: 'COMPLETED',
          timestamp: new Date().toLocaleString(),
          latencyMs,
          payload: parsedPayload
        };
        setJobs((prev) => [newJob, ...prev]);

      } else {
        const errorText = await response.text().catch(() => '');
        const errMsg = `Error: ${response.status} ${response.statusText} ${errorText}`;
        setStatus(errMsg);
        addToast(errMsg, 'error');
      }
    } catch (error) {
      console.error(error);
      const failMsg = `Failed to send request: ${error.message}`;
      setStatus(failMsg);
      addToast(failMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Wrap the UI in the Authenticator component
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app-container">
          {/* Header */}
          <header className="navbar" style={{ padding: '1rem 2rem' }}>
            <div className="nav-wrapper">
              <div className="brand">
                <div className="brand-icon">⚡</div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                    AWS Serverless Data Processor
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Event-Driven Architecture | Region: ap-south-1
                  </span>
                </div>
              </div>

              <div className="nav-actions">
                <div className="aws-region-badge">
                  <Globe size={14} />
                  <span>ap-south-1</span>
                  <span className="region-dot" title="AWS Region Active"></span>
                </div>

                <div className="user-profile">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.signInDetails?.loginId || user?.username || 'Architect'}</strong>
                  </span>
                  <button 
                    onClick={signOut} 
                    className="btn btn-secondary btn-outline-danger"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="main-content" style={{ padding: '2rem 1.5rem' }}>
            {/* Architecture Flow Banner */}
            <ArchitectureBanner />

            <div className="dashboard-grid">
              {/* Submit Data Processing Job Card */}
              <section className="card" aria-label="Submit Data Processing Job Section">
                <div className="card-header">
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
                      Submit Data Processing Job
                    </h3>
                    <p className="card-subtitle">
                      Dispatches payload to AWS Lambda Function URL with Cognito Authorization
                    </p>
                  </div>
                </div>

                {/* Sample Template Helpers */}
                <div className="form-group">
                  <div className="form-label">
                    <span>Quick Templates</span>
                    <div className="form-actions-inline">
                      <button 
                        type="button" 
                        className="action-chip" 
                        onClick={() => loadSample('ORDER_PROCESSING')}
                      >
                        Order Event
                      </button>
                      <button 
                        type="button" 
                        className="action-chip" 
                        onClick={() => loadSample('IMAGE_RESIZE')}
                      >
                        S3 Pipeline
                      </button>
                      <button 
                        type="button" 
                        className="action-chip" 
                        onClick={() => loadSample('IOT_TELEMETRY')}
                      >
                        IoT Sensor
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payload Textarea */}
                <div className="form-group">
                  <div className="form-label">
                    <span>JSON Payload</span>
                    <button 
                      type="button" 
                      className="action-chip" 
                      onClick={formatJson}
                    >
                      <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
                      Prettify JSON
                    </button>
                  </div>

                  <div className="code-editor-wrapper">
                    <textarea 
                      rows="8" 
                      className="json-textarea"
                      placeholder="Paste JSON payload here..."
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                    />
                  </div>
                </div>

                {/* Target Endpoint Notice */}
                <div className="endpoint-notice" style={{ margin: '1rem 0' }}>
                  <div className="endpoint-header">
                    <span>TARGET LAMBDA URL:</span>
                  </div>
                  <div className="endpoint-url" style={{ fontSize: '0.75rem' }}>
                    {LAMBDA_URL}
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  id="submit-job-btn"
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#FF9900', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Sending to Lambda...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Job</span>
                    </>
                  )}
                </button>
                
                {status && (
                  <div 
                    style={{ 
                      marginTop: '1.25rem', 
                      padding: '0.75rem', 
                      borderRadius: '6px',
                      backgroundColor: status.startsWith('Success') ? 'rgba(16, 185, 129, 0.15)' : status.startsWith('Error') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      border: `1px solid ${status.startsWith('Success') ? 'var(--status-completed)' : status.startsWith('Error') ? 'var(--status-failed)' : 'var(--aws-cyan)'}`,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      wordBreak: 'break-word'
                    }}
                  >
                    <p style={{ margin: 0 }}>{status}</p>
                  </div>
                )}
              </section>

              {/* Job Execution Status Table */}
              <section aria-label="Job Status Table Section">
                <JobTable jobs={jobs} addToast={addToast} />
              </section>
            </div>
          </main>

          {/* Toast Stack */}
          <div className="toast-container" aria-live="polite">
            {toasts.map((toast) => (
              <div key={toast.id} className={`toast ${toast.type}`}>
                <span>{toast.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Authenticator>
  );
}
