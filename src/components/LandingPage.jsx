import React from 'react';
import { ArrowRight, Wallet, TrendingUp, PieChart, Shield } from 'lucide-react';

export default function LandingPage({ onGetStarted, onLoginGoogle }) {
  return (
    <div className="landing-hero" style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div className="landing-left">
        <div className="landing-badge">
          <Wallet size={16} />
          <span>Polished Student Budgeting</span>
        </div>
        <h1 className="landing-title">
          Where Did My<br />
          <span>Money Go?</span>
        </h1>
        <p className="landing-tagline">
          "Know where it went. Decide where it goes next."
        </p>
        <p className="landing-desc">
          Designed specifically for college life. Set priority-based budgets, run simulated expense checks, and get dynamic analytics tailored to a student's budget.
        </p>
        
        <div className="landing-actions">
          <button className="btn btn-primary" onClick={onGetStarted}>
            Get Started
            <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary" onClick={onLoginGoogle}>
            <span style={{ fontWeight: 700, color: '#4285F4', marginRight: '0.25rem' }}>G</span> Continue with Google
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', opacity: 0.8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Shield size={16} style={{ color: 'var(--emerald-500)' }} />
            <span>Local & Secure</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--indigo-500)' }} />
            <span>Interactive Tools</span>
          </div>
        </div>
      </div>
      
      <div className="landing-right">
        {/* Animated Visual representation (Generic) */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '350px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          
          <div className="card glass-panel" style={{ 
            boxShadow: 'var(--shadow-premium)', 
            transform: 'rotate(-4deg)',
            zIndex: 3,
            animation: 'float 6s ease-in-out infinite',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '1rem'
          }}>
            <div style={{ 
              width: '4rem', height: '4rem', borderRadius: '50%', 
              backgroundColor: 'var(--indigo-100)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center' 
            }}>
              <Wallet size={32} style={{ color: 'var(--indigo-600)' }} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-700)' }}>Plan Your Budget</span>
          </div>
          
          <div className="card" style={{ 
            position: 'absolute', 
            top: '120px', 
            left: '40px', 
            transform: 'rotate(6deg)',
            background: 'linear-gradient(135deg, #ffffff, #fcfcff)',
            zIndex: 1,
            opacity: 0.95,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem'
          }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--emerald-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ color: 'var(--emerald-600)' }} size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Track Spending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
