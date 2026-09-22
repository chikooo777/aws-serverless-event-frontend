import React, { useState } from 'react';
import { Copy, Check, Eye, Search, Filter, Database, Clock, X, Terminal, CheckCircle2 } from 'lucide-react';

export default function JobTable({ jobs, addToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [copiedModalJson, setCopiedModalJson] = useState(false);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    addToast(`Copied job ID: ${id.slice(0, 16)}...`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyModalPayload = (payload) => {
    const text = typeof payload === 'object' ? JSON.stringify(payload, null, 2) : payload;
    navigator.clipboard.writeText(text);
    setCopiedModalJson(true);
    addToast('Payload JSON copied to clipboard', 'info');
    setTimeout(() => setCopiedModalJson(false), 2000);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.eventType && job.eventType.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="panel" aria-label="Job Processing Status Visualizer">
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 className="section-title">
            <Database size={18} color="var(--cyan)" />
            <span>Job Ledger</span>
          </h2>
          <p className="section-sub">Execution history committed to DynamoDB</p>
        </div>
        <div className="tag" style={{ color: 'var(--cyan)', borderColor: 'rgba(45,212,232,0.3)', background: 'var(--cyan-dim)' }}>
          <span>{filteredJobs.length} Events Logged</span>
        </div>
      </div>

      <div className="table-toolbar" style={{ marginTop: '1rem' }}>
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by job ID or event type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={13} color="var(--slate)" />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Event type</th>
              <th>Submitted</th>
              <th>Latency</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Payload</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job.jobId}>
                  <td>
                    <div className="uuid-cell">
                      <span>{job.jobId.slice(0, 18)}...</span>
                      <button className="icon-btn" onClick={() => handleCopyId(job.jobId)} title="Copy full ID">
                        {copiedId === job.jobId ? <Check size={13} color="var(--mint)" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{job.eventType || 'DataProcessing'}</td>
                  <td>
                    <span style={{ color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={12} />
                      {job.timestamp}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--slate)' }}>
                    {job.latencyMs ? `${job.latencyMs} ms` : '—'}
                  </td>
                  <td>
                    <span className={`status-badge ${job.status.toLowerCase()}`}>
                      <span className="dot" />
                      {job.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }} onClick={() => setSelectedPayload(job)}>
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <Database size={32} style={{ opacity: 0.35, color: 'var(--cyan)' }} />
                    <p>No jobs found</p>
                    <p>Submit a payload from the Ingestion Playground to see it recorded here.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Frosted Glass Inspector Modal */}
      {selectedPayload && (
        <div className="modal-overlay" onClick={() => setSelectedPayload(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  <Terminal size={16} color="var(--cyan)" />
                  <span>Payload Inspector: {selectedPayload.jobId.slice(0, 18)}...</span>
                </h3>
                <span className="modal-meta">
                  {selectedPayload.timestamp} · Status: {selectedPayload.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                  onClick={() => handleCopyModalPayload(selectedPayload.payload)}
                  title="Copy payload JSON"
                >
                  {copiedModalJson ? <Check size={12} color="var(--mint)" /> : <Copy size={12} />}
                  <span>{copiedModalJson ? 'Copied' : 'Copy'}</span>
                </button>
                <button className="icon-btn" onClick={() => setSelectedPayload(null)} title="Close Modal">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <pre className="modal-code">
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
