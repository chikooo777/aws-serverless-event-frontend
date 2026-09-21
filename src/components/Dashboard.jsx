import React from 'react';
import { Layers, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import JobSubmitForm from './JobSubmitForm';
import JobTable from './JobTable';
import ArchitectureBanner from './ArchitectureBanner';

export default function Dashboard({ jobs, onJobCreated, addToast }) {
  // Compute real-time pipeline statistics
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => j.status === 'PENDING' || j.status === 'PROCESSING').length;
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
  const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 100;

  return (
    <div>
      {/* Visual Serverless Architecture Banner */}
      <ArchitectureBanner />

      {/* Cloud Performance Metrics Summary */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Total Ingress Jobs</span>
            <span className="metric-value">{totalJobs}</span>
          </div>
          <div className="metric-icon-wrap" style={{ color: 'var(--aws-amber)' }}>
            <Layers size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Active / In-Flight</span>
            <span className="metric-value" style={{ color: 'var(--status-processing)' }}>
              {pendingJobs}
            </span>
          </div>
          <div className="metric-icon-wrap" style={{ color: 'var(--status-processing)' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Successfully Processed</span>
            <span className="metric-value" style={{ color: 'var(--status-completed)' }}>
              {completedJobs}
            </span>
          </div>
          <div className="metric-icon-wrap" style={{ color: 'var(--status-completed)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Event Pipeline Health</span>
            <span className="metric-value" style={{ color: 'var(--aws-cyan)' }}>
              {successRate}%
            </span>
          </div>
          <div className="metric-icon-wrap" style={{ color: 'var(--aws-cyan)' }}>
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Job Submission (Left) & Job Status Table (Right) */}
      <div className="dashboard-grid">
        <section aria-labelledby="job-submission-section">
          <JobSubmitForm onJobCreated={onJobCreated} addToast={addToast} />
        </section>

        <section aria-labelledby="job-status-section">
          <JobTable jobs={jobs} addToast={addToast} />
        </section>
      </div>
    </div>
  );
}
