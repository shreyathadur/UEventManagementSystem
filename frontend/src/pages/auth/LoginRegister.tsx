import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { checkBackendHealth, waitForBackend } from '../../api/client';
import { LogIn, UserPlus, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginRegister: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_USER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'live' | 'starting'>('checking');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let pollInterval: any = null;

    const checkStatus = async () => {
      const isLive = await checkBackendHealth();
      if (!active) return;
      
      if (isLive) {
        setBackendStatus('live');
        setError('');
      } else {
        setBackendStatus('starting');
        setError('Backend is starting, please try again in a moment.');
        
        // Start polling every 5 seconds until online
        pollInterval = setInterval(async () => {
          const liveNow = await checkBackendHealth();
          if (active && liveNow) {
            setBackendStatus('live');
            setError('');
            if (pollInterval) clearInterval(pollInterval);
          }
        }, 5000);
      }
    };

    checkStatus();

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Final check before hitting the auth endpoint
    let isLive = await checkBackendHealth();
    if (!isLive) {
      setBackendStatus('starting');
      setError('Waking up backend (this may take up to 50 seconds on Render)...');
      
      isLive = await waitForBackend(10, 5000);
      
      if (!isLive) {
        setError('Backend is taking too long to start. Please try again.');
        setLoading(false);
        return;
      }
      
      setBackendStatus('live');
      setError('');
    }

    try {
      let data;
      if (isLogin) {
        data = await authApi.login({ email, password });
      } else {
        data = await authApi.register({ name, email, password, role });
      }

      login(data);
      // Redirect based on role
      if (data.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (data.role === 'ROLE_VOLUNTEER') {
        navigate('/volunteer');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '2rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        boxShadow: 'var(--glass-shadow)'
      }}>
        
        {/* Toggle Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '2rem' }}>
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              color: isLogin ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))',
              fontWeight: 600,
              fontSize: '1.1rem',
              borderBottom: isLogin ? '2px solid hsl(var(--accent-indigo))' : 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              color: !isLogin ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))',
              fontWeight: 600,
              fontSize: '1.1rem',
              borderBottom: !isLogin ? '2px solid hsl(var(--accent-indigo))' : 'none',
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            color: '#f43f5e',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="Shreya Sen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="student@uems.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                style={{ width: '100%', paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'hsl(var(--text-muted))',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Register As</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
                style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
              >
                <option value="ROLE_USER">Student / Participant</option>
                <option value="ROLE_VOLUNTEER">Volunteer</option>
                <option value="ROLE_ADMIN">Campus Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || backendStatus === 'checking'}
            style={{ 
              width: '100%', 
              marginTop: '1.5rem', 
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Processing...
              </>
            ) : isLogin ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Create Account
              </>
            )}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          fontSize: '0.85rem', 
          color: 'hsl(var(--text-muted))', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Shield size={14} /> Secure JWT Encrypted Portal
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: backendStatus === 'live' ? '#10b981' : backendStatus === 'starting' ? '#f59e0b' : '#6b7280',
              boxShadow: backendStatus === 'live' ? '0 0 8px #10b981' : backendStatus === 'starting' ? '0 0 8px #f59e0b' : 'none',
              transition: 'all 0.3s ease'
            }} />
            <span>
              {backendStatus === 'live' ? 'Backend Online' : backendStatus === 'starting' ? 'Backend Starting (Render cold start)...' : 'Checking connection...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
