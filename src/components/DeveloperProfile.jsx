import React from 'react';
import { Github, Linkedin, ExternalLink, Award, Terminal, Cpu, Zap, Cloud, Code } from 'lucide-react';

export default function DeveloperProfile() {
  return (
    <div className="glass-panel developer-profile-card">
      <div className="dev-info-left">
        <div className="dev-avatar" title="Durvesh Raysing">
          <span>DR</span>
        </div>

        <div className="dev-details">
          <div className="dev-name-wrap">
            <h1 className="dev-name">Durvesh Raysing</h1>
            <span className="dev-badge highlight">
              <Award size={12} style={{ display: 'inline', marginRight: '4px' }} />
              AWS Certified Cloud Practitioner
            </span>
          </div>

          <div className="dev-badge-list">
            <span className="dev-badge tech">
              <Terminal size={11} style={{ display: 'inline', marginRight: '3px' }} />
              Python Developer
            </span>
            <span className="dev-badge ai">
              <Cpu size={11} style={{ display: 'inline', marginRight: '3px' }} />
              AI/ML Engineer
            </span>
            <span className="dev-badge">
              <Code size={11} style={{ display: 'inline', marginRight: '3px' }} />
              MCA
            </span>
          </div>

          <div className="arch-tag-banner">
            <Zap size={14} color="var(--aws-amber)" />
            <span>AWS Serverless Event-Driven Architecture (Decoupled SQS + Lambda + DynamoDB)</span>
          </div>
        </div>
      </div>

      {/* Social & Portfolio Links */}
      <div className="dev-socials">
        <a 
          href="https://github.com/chikooo777" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-glass-btn github"
          title="GitHub Profile"
        >
          <Github size={16} />
          <span>GitHub</span>
          <ExternalLink size={12} style={{ opacity: 0.6 }} />
        </a>

        <a 
          href="https://www.linkedin.com/in/durvesh-raysing07" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-glass-btn linkedin"
          title="LinkedIn Profile"
        >
          <Linkedin size={16} color="#38bdf8" />
          <span>LinkedIn</span>
          <ExternalLink size={12} style={{ opacity: 0.6 }} />
        </a>

        <a 
          href="https://chikooo777.github.io" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-glass-btn portfolio"
          title="Developer Portfolio"
        >
          <Cloud size={16} color="var(--aws-cyan)" />
          <span>Portfolio</span>
          <ExternalLink size={12} style={{ opacity: 0.6 }} />
        </a>
      </div>
    </div>
  );
}
