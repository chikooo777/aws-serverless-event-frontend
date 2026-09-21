import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Cpu, Database, Zap, Shield, ArrowRight, Bell, Radio } from 'lucide-react';

export default function ArchitectureBanner() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="glass-panel pipeline-flow-card">
      <div className="pipeline-header">
        <div className="pipeline-title">
          <Layers size={18} color="var(--aws-amber)" />
          <span>Decoupled Architecture Flow: Asynchronous Serverless Ingestion Route</span>
        </div>
        <button 
          className="btn-glass" 
          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{isOpen ? 'Collapse Pipeline' : 'Expand Pipeline'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="pipeline-nodes-row">
          {/* Node 1: Client */}
          <div className="pipeline-node-box active">
            <div className="node-icon-wrap" style={{ color: 'var(--aws-amber)' }}>
              <Zap size={18} />
            </div>
            <div>
              <div className="node-title">React Client</div>
              <div className="node-role">Cognito JWT Auth</div>
            </div>
          </div>

          <div className="flow-connector"><ArrowRight size={16} /></div>

          {/* Node 2: Lambda Ingress URL */}
          <div className="pipeline-node-box active">
            <div className="node-icon-wrap" style={{ color: '#38bdf8' }}>
              <Cpu size={18} />
            </div>
            <div>
              <div className="node-title">Lambda Function URL</div>
              <div className="node-role">HTTPS Ingress Gateway</div>
            </div>
          </div>

          <div className="flow-connector"><ArrowRight size={16} /></div>

          {/* Node 3: Amazon SQS */}
          <div className="pipeline-node-box">
            <div className="node-icon-wrap" style={{ color: '#c084fc' }}>
              <Radio size={18} />
            </div>
            <div>
              <div className="node-title">Amazon SQS Queue</div>
              <div className="node-role">Decoupled FIFO Buffer</div>
            </div>
          </div>

          <div className="flow-connector"><ArrowRight size={16} /></div>

          {/* Node 4: Worker Lambda */}
          <div className="pipeline-node-box">
            <div className="node-icon-wrap" style={{ color: 'var(--aws-amber)' }}>
              <Cpu size={18} />
            </div>
            <div>
              <div className="node-title">Worker Lambda</div>
              <div className="node-role">Event Processing Engine</div>
            </div>
          </div>

          <div className="flow-connector"><ArrowRight size={16} /></div>

          {/* Node 5: DynamoDB & SNS */}
          <div className="pipeline-node-box">
            <div className="node-icon-wrap" style={{ color: 'var(--status-completed)' }}>
              <Database size={18} />
            </div>
            <div>
              <div className="node-title">DynamoDB & SNS</div>
              <div className="node-role">State Store & Alerts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
