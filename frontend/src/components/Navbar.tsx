import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogOut, User, Key, LayoutGrid } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }} className="badge">Admin</span>;
      case 'ROLE_VOLUNTEER':
        return <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }} className="badge">Volunteer</span>;
      default:
        return <span style={{ color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }} className="badge">Student</span>;
    }
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '1rem',
      margin: '1rem 2rem',
      padding: '0.75rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Calendar size={28} className="gradient-text" style={{ color: '#6366f1' }} />
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-headings)' }} className="gradient-text">
          UEMS
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" style={{ fontWeight: 500, color: 'hsl(var(--text-secondary))' }} className="nav-link">Events</Link>
        
        {isAuthenticated ? (
          <>
            {user?.role === 'ROLE_ADMIN' && (
              <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }} className="nav-link">
                <LayoutGrid size={16} /> Admin Portal
              </Link>
            )}
            {user?.role === 'ROLE_VOLUNTEER' && (
              <Link to="/volunteer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }} className="nav-link">
                <LayoutGrid size={16} /> Volunteer Portal
              </Link>
            )}
            
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }} className="nav-link">
              <User size={16} /> My Tickets
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</span>
                {getRoleBadge(user?.role || '')}
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', border: 'none' }} title="Logout">
                <LogOut size={18} style={{ color: '#ec4899' }} />
              </button>
            </div>
          </>
        ) : (
          <Link to="/auth" className="btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px' }}>
            <Key size={16} /> Login
          </Link>
        )}
      </div>
    </nav>
  );
};
