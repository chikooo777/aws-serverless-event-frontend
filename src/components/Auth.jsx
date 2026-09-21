import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Server, Key } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [email, setEmail] = useState('cloud.architect@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulated Cognito authentication latency
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        email: email || 'architect@aws.internal',
        name: 'Solutions Architect',
        sub: 'cognito-sub-190283-us-east-1',
        token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.mock_cognito_id_token'
      });
    }, 450);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <Lock size={26} />
        </div>

        <h1 className="auth-title">AWS Console Login</h1>
        <p className="auth-desc">
          Sign in via Amazon Cognito to access the Serverless Event-Driven Data Processing Pipeline.
        </p>

        <div className="cognito-badge">
          <ShieldCheck size={14} />
          Amazon Cognito User Pool Protected
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="cognito-email">
              <span>IAM / Cognito Email</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="cognito-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@aws.internal"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cognito-password">
              <span>Password</span>
            </label>
            <input
              id="cognito-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Authenticating with Cognito...</span>
            ) : (
              <>
                <span>Sign In with Cognito</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-demo-hint">
          <div style={{ fontWeight: 600, color: 'var(--aws-amber)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Key size={13} />
            <span>Developer Note / Amplify Drop-in:</span>
          </div>
          To connect AWS Amplify, replace the mock toggle with:
          <br />
          <code style={{ color: 'var(--aws-cyan)', fontFamily: 'var(--font-mono)' }}>
            await signIn(&#123; username, password &#125;)
          </code>
        </div>
      </div>
    </div>
  );
}
