import React from 'react';
import { Cloud, ShieldCheck, LogOut, LogIn, Globe } from 'lucide-react';

export default function Navbar({ isAuthenticated, user, onLogin, onLogout }) {
  return (
    <header className="navbar">
      <div className="nav-wrapper">
        <div className="brand">
          <div className="brand-icon">
            <Cloud size={20} />
          </div>
          <div>
            <div className="brand-title">
              Serverless Event Console
              <span className="brand-badge">AWS v2.0</span>
            </div>
          </div>
        </div>

        <div className="nav-actions">
          <div className="aws-region-badge">
            <Globe size={14} />
            <span>us-east-1</span>
            <span className="region-dot" title="AWS Region Active"></span>
          </div>

          {isAuthenticated ? (
            <div className="user-profile">
              <div className="avatar">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="user-meta">
                <span className="user-name">{user?.name || 'Architect User'}</span>
                <span className="user-role">
                  <ShieldCheck size={12} />
                  Cognito Authenticated
                </span>
              </div>
              <button 
                className="btn btn-ghost btn-outline-danger" 
                onClick={onLogout}
                title="Sign out of Amazon Cognito"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={onLogin}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
