import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { signOut } from 'aws-amplify/auth';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { INITIAL_JOBS } from './utils/mockData';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});

export default function App() {
  // Cognito Authentication Placeholder State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({
    name: 'AWS Solutions Architect',
    email: 'architect@aws.internal',
    role: 'Cloud Architect'
  });

  // Global Job List State (initialized with realistic seed events)
  const [jobs, setJobs] = useState(INITIAL_JOBS);

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Handle Cognito mock login
  const handleLogin = (authenticatedUser) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    addToast('Successfully authenticated via Amazon Cognito', 'success');
  };

  // Handle Cognito sign out
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn('Amplify signOut warning:', err);
    }
    setIsAuthenticated(false);
    setUser(null);
    addToast('Signed out from Amazon Cognito session', 'info');
  };

  // Handle new Job Submission into EventBridge
  const handleJobCreated = (newJob) => {
    // 1. Add to top of list as PENDING
    setJobs((prev) => [newJob, ...prev]);

    // 2. Asynchronously simulate event-driven worker progression:
    // EventBridge routes event -> Lambda worker starts processing (2.5s)
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.jobId === newJob.jobId && j.status === 'PENDING'
            ? { ...j, status: 'PROCESSING' }
            : j
        )
      );
    }, 2500);

    // Lambda worker completes job -> writes final state to DynamoDB (5.0s)
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.jobId === newJob.jobId && (j.status === 'PENDING' || j.status === 'PROCESSING')
            ? { ...j, status: 'COMPLETED' }
            : j
        )
      );
      addToast(`Job ${newJob.jobId.slice(0, 16)} completed processing!`, 'success');
    }, 5000);
  };

  return (
    <div className="app-container">
      {/* Top AWS Console Navigation Bar */}
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={() => setIsAuthenticated(true)}
        onLogout={handleLogout}
      />

      {/* Main View: Conditional Rendering based on Cognito Authentication */}
      <main className="main-content">
        {isAuthenticated ? (
          <Dashboard
            jobs={jobs}
            onJobCreated={handleJobCreated}
            addToast={addToast}
          />
        ) : (
          <Auth onLoginSuccess={handleLogin} />
        )}
      </main>

      {/* Floating Toast Notification Stack */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={16} color="var(--status-completed)" />}
            {toast.type === 'error' && <AlertCircle size={16} color="var(--status-failed)" />}
            {toast.type === 'info' && <Info size={16} color="var(--aws-cyan)" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
