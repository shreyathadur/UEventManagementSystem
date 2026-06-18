import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { LogIn, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';

export const LoginRegister: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_USER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
            disabled={loading}
            style={{ width: '100%', marginTop: '1.5rem', height: '45px' }}
          >
            {loading ? 'Processing...' : isLogin ? (
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

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <Shield size={14} /> Secure JWT Encrypted Portal
        </div>
      </div>
    </div>
  );
};
