import React, { useState } from 'react';
import { KeyRound, Zap, ListOrdered, Cog, Database, Activity, Sparkles } from 'lucide-react';

const NODES = [
  { 
    key: 'auth', 
    label: 'Cognito', 
    sub: 'JWT ID token', 
    icon: KeyRound,
    desc: 'Verifies RSA signatures & issues OAuth2 Bearer identity tokens'
  },
  { 
    key: 'lambda', 
    label: 'Lambda URL', 
    sub: 'HTTPS ingress', 
    icon: Zap, 
    active: true,
    desc: 'Public sub-second HTTPS endpoint with zero cold-start API Gateway latency'
  },
  { 
    key: 'sqs', 
    label: 'SQS FIFO', 
    sub: 'ordered queue', 
    icon: ListOrdered,
    desc: 'Guarantees strictly once, in-order execution with dedup hash'
  },
  { 
    key: 'worker', 
    label: 'Worker Lambda', 
    sub: 'processes event', 
    icon: Cog,
    desc: 'Async compute engine transforming & evaluating telemetry in parallel'
  },
  { 
    key: 'store', 
    label: 'DynamoDB + SNS', 
    sub: 'persist & notify', 
    icon: Database,
    desc: 'Sub-10ms single-table persistence and multi-subscriber alerting'
  },
];

export default function ArchitectureBanner({ pulseKey }) {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="panel trace-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Activity size={15} color="var(--cyan)" />
          <p className="trace-heading" style={{ margin: 0 }}>Event Path — Serverless Reactive Pipeline</p>
        </div>
        <div className="tag" style={{ color: 'var(--mint)', borderColor: 'rgba(62, 207, 142, 0.35)', background: 'var(--mint-dim)' }}>
          <span className="pulse-dot" style={{ backgroundColor: 'var(--mint)' }} />
          <span>Live Ingress Bus Active</span>
        </div>
      </div>

      <div className="trace-rail">
        <div className="trace-line" />
        {pulseKey ? <div key={pulseKey} className="trace-packet" /> : null}
        {NODES.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedNode?.key === node.key;
          return (
            <div
              key={node.key}
              className={`trace-node${node.active ? ' active' : ''}${isSelected ? ' node-focused' : ''}`}
              onClick={() => setSelectedNode(isSelected ? null : node)}
              title={node.desc}
              style={{ cursor: 'pointer' }}
            >
              <div className="trace-node-icon">
                <Icon size={18} />
              </div>
              <div className="trace-node-label">{node.label}</div>
              <div className="trace-node-sub">{node.sub}</div>
            </div>
          );
        })}
      </div>

      {selectedNode && (
        <div 
          className="endpoint-strip" 
          style={{ 
            marginTop: '1rem', 
            animation: 'fadeIn 0.2s ease', 
            background: 'rgba(24, 31, 48, 0.8)',
            borderLeft: '3px solid var(--cyan)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)', fontWeight: 600, fontSize: '0.78rem' }}>
            <Sparkles size={12} />
            <span>Node Specification: {selectedNode.label} ({selectedNode.sub})</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)', marginTop: '0.3rem' }}>
            {selectedNode.desc}
          </p>
        </div>
      )}
    </div>
  );
}
