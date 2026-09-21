import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Cpu, Database, Zap, Shield, ArrowRight } from 'lucide-react';

export default function ArchitectureBanner() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="architecture-banner">
      <div className="banner-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={18} color="var(--aws-amber)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Architecture Overview: Serverless Event-Driven Pipeline
          </span>
        </div>
        <button 
          className="btn btn-ghost" 
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{isOpen ? 'Collapse Flow' : 'Expand Flow'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="pipeline-nodes">
          <div className="pipeline-node active-flow">
            <div className="pipeline-node-icon">
              <Zap size={18} />
            </div>
            <div>
              <div className="pipeline-node-title">React Client (Vite)</div>
              <div className="pipeline-node-desc">JSON Payload Dispatch</div>
            </div>
          </div>

          <div className="pipeline-arrow"><ArrowRight size={16} /></div>

          <div className="pipeline-node">
            <div className="pipeline-node-icon" style={{ color: '#818cf8' }}>
              <Shield size={18} />
            </div>
            <div>
              <div className="pipeline-node-title">Amazon Cognito</div>
              <div className="pipeline-node-desc">JWT Auth Verification</div>
            </div>
          </div>

          <div className="pipeline-arrow"><ArrowRight size={16} /></div>

          <div className="pipeline-node active-flow">
            <div className="pipeline-node-icon">
              <Cpu size={18} />
            </div>
            <div>
              <div className="pipeline-node-title">Lambda Function URL</div>
              <div className="pipeline-node-desc">HTTPS Ingress Gateway</div>
            </div>
          </div>

          <div className="pipeline-arrow"><ArrowRight size={16} /></div>

          <div className="pipeline-node">
            <div className="pipeline-node-icon" style={{ color: 'var(--aws-amber)' }}>
              <Layers size={18} />
            </div>
            <div>
              <div className="pipeline-node-title">Amazon EventBridge</div>
              <div className="pipeline-node-desc">Pub/Sub Bus Routing</div>
            </div>
          </div>

          <div className="pipeline-arrow"><ArrowRight size={16} /></div>

          <div className="pipeline-node">
            <div className="pipeline-node-icon" style={{ color: 'var(--aws-cyan)' }}>
              <Database size={18} />
            </div>
            <div>
              <div className="pipeline-node-title">DynamoDB / S3</div>
              <div className="pipeline-node-desc">Event Store & Results</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
