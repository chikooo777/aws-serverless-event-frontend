import React from 'react';
import { Github, Linkedin, ExternalLink, Award, Terminal, Cpu, Code2, Zap } from 'lucide-react';

export default function DeveloperProfile() {
  return (
    <div className="panel operator-strip">
      <div className="operator-left">
        <div className="operator-mark" title="Durvesh Raysing">DR</div>

        <div>
          <div className="operator-name-row">
            <h1 className="operator-name">Durvesh Raysing</h1>
            <span className="operator-credential">
              <Award size={13} />
              AWS Certified Cloud Practitioner
            </span>
          </div>

          <div className="operator-tags">
            <span className="tag"><Terminal size={11} /> Python Developer</span>
            <span className="tag"><Cpu size={11} /> AI/ML Engineer</span>
            <span className="tag"><Code2 size={11} /> MCA</span>
          </div>

          <div className="tag" style={{ marginTop: '0.6rem', color: 'var(--amber)', borderColor: 'rgba(255,153,0,0.3)' }}>
            <Zap size={11} />
            <span>Event-driven pipeline: SQS FIFO + Lambda + DynamoDB</span>
          </div>
        </div>
      </div>

      <div className="operator-links">
        <a href="https://github.com/chikooo777" target="_blank" rel="noopener noreferrer" className="link-btn">
          <Github size={15} />
          <span>GitHub</span>
          <ExternalLink size={11} style={{ opacity: 0.5 }} />
        </a>
        <a href="https://www.linkedin.com/in/durvesh-raysing07" target="_blank" rel="noopener noreferrer" className="link-btn">
          <Linkedin size={15} color="var(--cyan)" />
          <span>LinkedIn</span>
          <ExternalLink size={11} style={{ opacity: 0.5 }} />
        </a>
        <a href="https://chikooo777.github.io" target="_blank" rel="noopener noreferrer" className="link-btn">
          <span>Portfolio</span>
          <ExternalLink size={11} style={{ opacity: 0.5 }} />
        </a>
      </div>
    </div>
  );
}
