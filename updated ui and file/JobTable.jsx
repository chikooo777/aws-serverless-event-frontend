import React, { useState } from 'react';
import { Copy, Check, Eye, Search, Filter, Database, Clock, X, Terminal } from 'lucide-react';

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
      <div className="section-head table-header-row">
        <div>
          <h2 className="section-title">
            <Database size={18} />
            <span>Job Ledger</span>
          </h2>
          <p className="section-sub">Execution history committed to DynamoDB</p>
        </div>
        <div className="tag events-logged-pill">
          <span>{filteredJobs.length} Events Logged</span>
        </div>
      </div>

      <div className="table-toolbar">
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
          <Filter size={13} />
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
                        {copiedId === job.jobId ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{job.eventType || 'DataProcessing'}</td>
                  <td>
                    <span className="timestamp-cell">
                      <Clock size={12} />
                      {job.timestamp}
                    </span>
                  </td>
                  <td className="latency-cell">
                    {job.latencyMs ? `${job.latencyMs} ms` : '—'}
                  </td>
                  <td>
                    <span className={`status-badge ${job.status.toLowerCase()}`}>
                      <span className="dot" />
                      {job.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-sm" onClick={() => setSelectedPayload(job)}>
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
                    <Database size={32} style={{ opacity: 0.3 }} />
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
                  <Terminal size={16} />
                  <span>Payload Inspector: {selectedPayload.jobId.slice(0, 18)}...</span>
                </h3>
                <span className="modal-meta">
                  {selectedPayload.timestamp} · Status: {selectedPayload.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleCopyModalPayload(selectedPayload.payload)}
                  title="Copy payload JSON"
                >
                  {copiedModalJson ? <Check size={12} /> : <Copy size={12} />}
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
