import React, { useState } from 'react';
import {
  KeyRound,
  Zap,
  ListOrdered,
  Cpu,
  Database,
  Activity,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const NODES = [
  {
    key: 'auth',
    label: 'Cognito',
    sub: 'JWT ID Token',
    badge: 'Auth Guard',
    color: '#6366f1',
    colorLight: 'rgba(99, 102, 241, 0.12)',
    colorGlow: 'rgba(99, 102, 241, 0.35)',
    icon: KeyRound,
    desc: 'Verifies RSA signatures & issues OAuth2 Bearer identity tokens to secure API ingress.'
  },
  {
    key: 'lambda',
    label: 'Lambda URL',
    sub: 'HTTPS Ingress',
    badge: 'Sub-Second',
    color: '#f59e0b',
    colorLight: 'rgba(245, 158, 11, 0.12)',
    colorGlow: 'rgba(245, 158, 11, 0.35)',
    icon: Zap,
    active: true,
    desc: 'Public sub-second HTTPS endpoint with zero cold-start API Gateway latency.'
  },
  {
    key: 'sqs',
    label: 'SQS FIFO',
    sub: 'Ordered Queue',
    badge: 'Dedup Hash',
    color: '#0ea5e9',
    colorLight: 'rgba(14, 165, 233, 0.12)',
    colorGlow: 'rgba(14, 165, 233, 0.35)',
    icon: ListOrdered,
    desc: 'Guarantees strictly-once, in-order execution with automated deduplication hash.'
  },
  {
    key: 'worker',
    label: 'Worker Lambda',
    sub: 'Async Processor',
    badge: 'ARM64 Compute',
    color: '#10b981',
    colorLight: 'rgba(16, 185, 129, 0.12)',
    colorGlow: 'rgba(16, 185, 129, 0.35)',
    icon: Cpu,
    desc: 'Asynchronous serverless compute engine transforming, validating, and routing event payloads.'
  },
  {
    key: 'store',
    label: 'DynamoDB + SNS',
    sub: 'Persist & Alert',
    badge: 'Sub-10ms',
    color: '#3b82f6',
    colorLight: 'rgba(59, 130, 246, 0.12)',
    colorGlow: 'rgba(59, 130, 246, 0.35)',
    icon: Database,
    desc: 'Single-table execution history persistence with real-time fanout notifications.'
  },
];

/**
 * Vertical Event Path — Serverless Reactive Pipeline
 * Fixed/Sticky vertical side menu with continuous top-to-bottom glowing beam animation,
 * clean subtle AWS colors, and glowing gradients.
 */
export default function ArchitectureBanner({ pulseKey }) {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="panel pipeline-side-card" aria-label="Event Path Architecture Pipeline">
      {/* Header with Live Status Indicator */}
      <div className="pipeline-side-header">
        <div className="pipeline-side-title-row">
          <div className="pipeline-header-icon-wrap" aria-hidden="true">
            <Activity size={17} />
          </div>
          <div>
            <h3 className="pipeline-side-title">Event Path</h3>
            <p className="pipeline-side-sub">Serverless Reactive Pipeline</p>
          </div>
        </div>

        <div className="pipeline-status-badge">
          <span className="pipeline-pulse-dot" />
          <span>Active Ingress</span>
        </div>
      </div>

      {/* Vertical Animated Rail Sequence (Up to Down) */}
      <div className="vertical-rail-wrapper">
        {/* Continuous Gradient Vertical Line from Cognito down to DynamoDB */}
        <div className="vertical-track-line" />

        {/* Continuous Light Beam Moving from Up to Down */}
        <div className="vertical-beam-traveler" aria-hidden="true" />

        {/* Dynamic High-Velocity Pulse on Ingress Submit */}
        {pulseKey ? (
          <div key={pulseKey} className="vertical-pulse-packet" aria-hidden="true" />
        ) : null}

        {/* Vertical Nodes List */}
        <div className="vertical-nodes-list">
          {NODES.map((node, index) => {
            const Icon = node.icon;
            const isSelected = selectedNode?.key === node.key;

            return (
              <div
                key={node.key}
                className={`vertical-node-item ${node.active ? 'is-active' : ''} ${
                  isSelected ? 'is-selected' : ''
                }`}
                style={{
                  '--node-color': node.color,
                  '--node-color-light': node.colorLight,
                  '--node-color-glow': node.colorGlow
                }}
                onClick={() => setSelectedNode(isSelected ? null : node)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedNode(isSelected ? null : node);
                  }
                }}
                title={`Click to view ${node.label} specification`}
              >
                {/* Node Icon Box with subtle color accent & glow */}
                <div className="vertical-node-icon-wrap">
                  <Icon size={17} style={{ color: node.color }} />
                  {node.active && <span className="active-pip" />}
                </div>

                {/* Node Content Info */}
                <div className="vertical-node-meta">
                  <div className="vertical-node-title-row">
                    <span className="vertical-node-label">{node.label}</span>
                    <span className="vertical-node-badge" style={{ color: node.color }}>
                      {node.badge}
                    </span>
                  </div>
                  <span className="vertical-node-sub">{node.sub}</span>
                </div>

                <div className="vertical-node-arrow">
                  <ChevronRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Spec Inspector Drawer */}
      {selectedNode && (
        <div
          className="vertical-spec-drawer"
          style={{
            borderColor: selectedNode.color,
            boxShadow: `0 8px 24px -4px ${selectedNode.colorGlow}`
          }}
        >
          <div className="vertical-spec-head">
            <Sparkles size={13} style={{ color: selectedNode.color }} />
            <span className="vertical-spec-title">
              {selectedNode.label} Spec
            </span>
          </div>
          <p className="vertical-spec-desc">{selectedNode.desc}</p>
        </div>
      )}

      {/* Side Menu Footer Summary */}
      <div className="pipeline-side-footer">
        <div className="pipeline-footer-metric">
          <ShieldCheck size={13} />
          <span>FIFO Dedup Buffer</span>
        </div>
        <div className="pipeline-footer-tag">
          <span>ap-south-1</span>
        </div>
      </div>
    </div>
  );
}
