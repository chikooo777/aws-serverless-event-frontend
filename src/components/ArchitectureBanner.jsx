import React from 'react';
import { KeyRound, Zap, ListOrdered, Cog, Database } from 'lucide-react';

// Rebuilt to match the pipeline described for this project. The active node
// highlights the ingress point (Lambda Function URL) since that's what the
// Ingestion Playground below actually talks to; the traveling packet plays
// whenever a job is submitted (see App.jsx's `pulseKey`).
const NODES = [
  { key: 'auth', label: 'Cognito', sub: 'JWT ID token', icon: KeyRound },
  { key: 'lambda', label: 'Lambda URL', sub: 'HTTPS ingress', icon: Zap, active: true },
  { key: 'sqs', label: 'SQS FIFO', sub: 'ordered queue', icon: ListOrdered },
  { key: 'worker', label: 'Worker Lambda', sub: 'processes event', icon: Cog },
  { key: 'store', label: 'DynamoDB + SNS', sub: 'persist & notify', icon: Database },
];

export default function ArchitectureBanner({ pulseKey }) {
  return (
    <div className="panel trace-panel">
      <p className="trace-heading">Event path — where a submitted job actually goes</p>
      <div className="trace-rail">
        <div className="trace-line" />
        {pulseKey ? <div key={pulseKey} className="trace-packet" /> : null}
        {NODES.map((node) => {
          const Icon = node.icon;
          return (
            <div key={node.key} className={`trace-node${node.active ? ' active' : ''}`}>
              <div className="trace-node-icon"><Icon size={17} /></div>
              <div className="trace-node-label">{node.label}</div>
              <div className="trace-node-sub">{node.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
