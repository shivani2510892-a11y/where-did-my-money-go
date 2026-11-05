import React, { useState } from 'react';
import { User, Mail, GraduationCap, RefreshCw, LogOut, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function Profile({ user, onResetApp, categories, totalBudget, budgetPeriod }) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleResetClick = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = () => {
    onResetApp();
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Profile Settings</h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>Manage your workspace and personal account details.</p>
      </div>

      {/* User Information Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ 
          width: '5rem', 
          height: '5rem', 
          borderRadius: '50%', 
          background: 'var(--grad-sunset)', 
          color: 'white',
          fontSize: '2.25rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: 'var(--shadow-md)'
        }}>
          {user.name ? user.name[0] : 'S'}
        </div>
        
        <h2 style={{ fontSize: '1.45rem', marginBottom: '0.25rem' }}>{user.name}</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--indigo-600)', background: 'var(--indigo-50)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
          Student Member
        </span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', textAlign: 'left', borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail size={18} style={{ color: 'var(--slate-600)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)', uppercase: 'true', fontWeight: 600 }}>Email Address</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.email || 'shivani@college.edu'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <GraduationCap size={18} style={{ color: 'var(--slate-600)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)', uppercase: 'true', fontWeight: 600 }}>College / University</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.college || 'State University'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* App Stats Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Workspace Statistics</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-50)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--slate-600)' }}>Overall Budget</span>
            <span style={{ fontWeight: 700 }}>₹{totalBudget.toLocaleString()} / {budgetPeriod === 'weekly' ? 'week' : 'month'}</span>
          </div>

          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-50)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--slate-600)' }}>Active Categories</span>
            <span style={{ fontWeight: 700 }}>{categories.length} categories</span>
          </div>

          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--slate-600)' }}>Storage Sandbox</span>
            <span style={{ fontWeight: 700, color: 'var(--emerald-600)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              🟢 LocalBrowser Active
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone Reset Data Card */}
      <div className="card" style={{ border: '1px solid rgba(244, 63, 94, 0.2)', background: 'var(--rose-50)', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--rose-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} /> Reset App Sandbox
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          Wipe out all stored category settings, transaction history logs, and user configurations from your local browser sandbox and restart the onboarding process fresh.
        </p>

        {!showConfirmReset ? (
          <button className="btn btn-danger" onClick={handleResetClick} style={{ width: '100%' }}>
            <RefreshCw size={16} /> Start Fresh / Reset Application
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rose-600)', textAlign: 'center' }}>
              ⚠️ Are you absolutely sure? All data will be deleted permanently.
            </span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirmReset(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmReset} style={{ flex: 1 }}>
                Yes, Delete Everything
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
