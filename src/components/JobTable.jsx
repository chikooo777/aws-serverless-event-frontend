import React, { useState } from 'react';
import { Copy, Check, Eye, Search, Filter, Database, Clock, X } from 'lucide-react';

export default function JobTable({ jobs, addToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPayload, setSelectedPayload] = useState(null);

  // Copy Job ID to clipboard with feedback
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    addToast(`Job ID copied to clipboard: ${id.slice(0, 18)}...`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.eventType && job.eventType.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Database size={18} color="var(--aws-cyan)" />
            Job Execution Status
          </h2>
          <p className="card-subtitle">
            Asynchronous event logs stored in Amazon DynamoDB & EventBridge
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls">
        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Job ID or Event Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="job-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Event / Detail Type</th>
              <th>Timestamp</th>
              <th>Latency</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job.jobId}>
                  {/* Job ID with Copy button */}
                  <td>
                    <div className="job-id-cell">
                      <span>{job.jobId.slice(0, 18)}...</span>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopyId(job.jobId)}
                        title="Copy complete UUID"
                      >
                        {copiedId === job.jobId ? (
                          <Check size={13} color="var(--status-completed)" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Event Type */}
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {job.eventType || 'CustomEvent'}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {job.timestamp}
                    </span>
                  </td>

                  {/* Latency */}
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {job.latencyMs ? `${job.latencyMs} ms` : '—'}
                    </span>
                  </td>

                  {/* Status Badge with animation */}
                  <td>
                    <span className={`status-badge ${job.status.toLowerCase()}`}>
                      <span className="pulse-dot"></span>
                      {job.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedPayload(job)}
                      title="Inspect JSON Payload"
                    >
                      <Eye size={13} />
                      <span>Payload</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <Database size={32} className="empty-state-icon" />
                    <p style={{ fontWeight: 600 }}>No jobs found</p>
                    <p style={{ fontSize: '0.8rem' }}>
                      {searchTerm || statusFilter !== 'ALL' 
                        ? 'Try clearing your search query or status filter.' 
                        : 'Submit a new data processing job using the form to see it here.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* JSON Payload Inspection Modal */}
      {selectedPayload && (
        <div className="modal-overlay" onClick={() => setSelectedPayload(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Payload Inspector: {selectedPayload.jobId.slice(0, 18)}...
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Submitted: {selectedPayload.timestamp} | Status: {selectedPayload.status}
                </span>
              </div>
              <button 
                className="btn btn-ghost" 
                style={{ padding: '0.3rem' }}
                onClick={() => setSelectedPayload(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <pre className="modal-json-pre">
                {JSON.stringify(selectedPayload.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
