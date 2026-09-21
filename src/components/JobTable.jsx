import React, { useState } from 'react';
import { Copy, Check, Eye, Search, Filter, Database, Clock, X, Terminal } from 'lucide-react';

export default function JobTable({ jobs, addToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPayload, setSelectedPayload] = useState(null);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    addToast(`Job ID copied to clipboard: ${id.slice(0, 16)}...`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.eventType && job.eventType.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-panel job-table-card">
      <div className="card-title-wrap">
        <h2 className="card-title">
          <Database size={20} color="var(--aws-cyan)" />
          <span>Job Processing Pipeline Visualizer</span>
        </h2>
        <p className="card-sub">
          Asynchronous execution logs committed to Amazon DynamoDB & SQS
        </p>
      </div>

      {/* Glass Toolbar */}
      <div className="table-toolbar-glass">
        <div className="search-glass-wrap">
          <Search size={15} className="search-glass-icon" />
          <input
            type="text"
            className="search-glass-input"
            placeholder="Search by Job UUID or Event Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            className="filter-glass-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-glass-scroll">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Job UUID</th>
              <th>Event / Detail Type</th>
              <th>Timestamp</th>
              <th>Latency</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job.jobId}>
                  <td>
                    <div className="job-uuid-cell">
                      <span>{job.jobId.slice(0, 18)}...</span>
                      <button
                        className="copy-glass-btn"
                        onClick={() => handleCopyId(job.jobId)}
                        title="Copy full UUID"
                      >
                        {copiedId === job.jobId ? (
                          <Check size={13} color="var(--status-completed)" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {job.eventType || 'DataProcessing'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={12} />
                      {job.timestamp}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {job.latencyMs ? `${job.latencyMs} ms` : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`neon-badge ${job.status.toLowerCase()}`}>
                      <span className="neon-dot"></span>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-glass"
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedPayload(job)}
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                  <Database size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>No processing jobs found</p>
                  <p style={{ fontSize: '0.8rem' }}>Submit a payload via the Ingestion Playground above.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Inspector */}
      {selectedPayload && (
        <div className="modal-glass-overlay" onClick={() => setSelectedPayload(null)}>
          <div className="modal-glass-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-glass-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Terminal size={16} color="var(--aws-cyan)" />
                  Payload Inspector: {selectedPayload.jobId.slice(0, 18)}...
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Submitted: {selectedPayload.timestamp} | Status: {selectedPayload.status}
                </span>
              </div>
              <button className="btn-glass" onClick={() => setSelectedPayload(null)} style={{ padding: '0.3rem' }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-glass-body">
              <pre className="modal-code-pre">
                {typeof selectedPayload.payload === 'object'
                  ? JSON.stringify(selectedPayload.payload, null, 2)
                  : selectedPayload.payload}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
