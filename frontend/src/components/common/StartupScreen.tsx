import React, { useEffect, useState } from 'react';
import { checkBackendHealthDetails } from '../../api/client';
import type { HealthStatus } from '../../api/client';
import { Loader2, Server, Database, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StartupScreenProps {
  onAvailable: () => void;
}

export const StartupScreen: React.FC<StartupScreenProps> = ({ onAvailable }) => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'Starting',
    backendLive: false,
    databaseLive: false,
    message: 'Initializing connection checks...'
  });
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const performCheck = async () => {
    setCountdown(5);
    const result = await checkBackendHealthDetails();
    setHealth(result);
    setAttempts(prev => prev + 1);

    if (result.status === 'Database Connected') {
      onAvailable();
    }
  };

  useEffect(() => {
    performCheck();
    
    // Main status check polling loop (5 seconds)
    const interval = setInterval(() => {
      performCheck();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (health.status === 'Database Connected') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 5;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [health]);

  // Color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Database Connected':
        return '#10b981'; // Green
      case 'Healthy':
        return '#f59e0b'; // Amber (Backend up, DB down)
      case 'Starting':
        return '#3b82f6'; // Blue
      default:
        return '#ef4444'; // Red
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      padding: '2rem'
    }}>
      {/* Dynamic Glowing background nodes */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${health.backendLive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.1)'} 0%, transparent 70%)`,
        top: '20%',
        left: '30%',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '3rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        {/* Animated rings */}
        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 2rem' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            border: `3px solid ${health.backendLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            inset: '8px',
            border: `3px dashed ${getStatusColor(health.status)}`,
            borderRadius: '50%',
            animation: 'spin 10s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            inset: '20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {health.status === 'Database Connected' ? (
              <ShieldCheck size={32} color="#10b981" />
            ) : health.status === 'Healthy' ? (
              <AlertTriangle size={32} color="#f59e0b" className="animate-pulse" />
            ) : (
              <Loader2 size={32} color={getStatusColor(health.status)} className="animate-spin" />
            )}
          </div>
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          University Event Management System
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Establishing connection to cloud backend services
        </p>

        {/* Detailed Status Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* API Server Node */}
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              <Server size={14} /> API SERVER
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: health.backendLive ? '#10b981' : '#f59e0b'
              }} />
              {health.backendLive ? 'Online' : health.status === 'Starting' ? 'Starting...' : 'Offline'}
            </div>
          </div>

          {/* Database Node */}
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              <Database size={14} /> POSTGRESQL DB
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: health.databaseLive ? '#10b981' : '#ef4444'
              }} />
              {health.databaseLive ? 'Connected' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Informative log / error text */}
        <div style={{
          background: health.status === 'Healthy' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.05)',
          border: health.status === 'Healthy' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '8px',
          padding: '1rem',
          fontSize: '0.85rem',
          color: health.status === 'Healthy' ? '#fbbf24' : '#ef4444',
          display: health.status === 'Database Connected' ? 'none' : 'block',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <strong>Status:</strong> {health.message || 'Waiting for system boot...'}
          {health.status === 'Starting' && (
            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              ℹ️ Render's free tier spins down services due to inactivity. Initial cold-starts can take 40-50 seconds to complete. Please do not close this window.
            </div>
          )}
        </div>

        {/* Polling / Retry Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          <div>
            Attempts: <strong>{attempts}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Retrying in {countdown}s</span>
            <button
              onClick={performCheck}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.6rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem'
              }}
            >
              <RefreshCw size={12} /> Retry Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
