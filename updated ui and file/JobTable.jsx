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
    addToast(`Copied job ID: ${id.slice(0, 16)}...`, 'info');
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
    <div className="panel" aria-label="Job Processing Status Visualizer">
      <div className="section-head">
        <h2 className="section-title">
          <Database size={18} color="var(--cyan)" />
          <span>Job ledger</span>
        </h2>
        <p className="section-sub">Execution history committed to DynamoDB</p>
      </div>

      <div className="table-toolbar" style={{ marginTop: '1rem' }}>
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by job ID or event type"
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
                  <td style={{ fontWeight: 600 }}>{job.eventType || 'DataProcessing'}</td>
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
                    <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.74rem' }} onClick={() => setSelectedPayload(job)}>
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
                    <Database size={28} style={{ opacity: 0.4 }} />
                    <p>No jobs yet</p>
                    <p>Submit a payload from the Ingestion Playground to see it here.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPayload && (
        <div className="modal-overlay" onClick={() => setSelectedPayload(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  <Terminal size={15} color="var(--cyan)" />
                  {selectedPayload.jobId.slice(0, 18)}...
                </h3>
                <span className="modal-meta">
                  {selectedPayload.timestamp} · {selectedPayload.status}
                </span>
              </div>
              <button className="icon-btn" onClick={() => setSelectedPayload(null)}>
                <X size={16} />
              </button>
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
