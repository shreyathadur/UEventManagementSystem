import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE, getAuthHeaders } from '../config';
import { QrScannerModal } from '../components/QrScannerModal';
import { ClipboardList, CheckCircle2, Clock, Star, ScanLine, XCircle } from 'lucide-react';

interface VolunteerTask {
  id: number;
  eventId: number;
  eventTitle: string;
  assignedRole: string;
  assignedTasks: string;
  hoursWorked: number;
  performanceRating: number | null;
  status: string;
}

export const VolunteerDashboardView: React.FC = () => {
  useAuth();
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Scanning states
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchVolunteerTasks();
  }, []);

  const fetchVolunteerTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/volunteers/my-tasks`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error('Failed to load volunteer roles');
      }

      setTasks(await res.json());
    } catch (err: any) {
      setError(err.message || 'Error fetching volunteer dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    setScanResult(null);

    try {
      const res = await fetch(`${API_BASE}/checkins/scan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ticketCode: decodedText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Verification and entry check-in failed');
      }

      setScanResult({
        success: true,
        message: `Successfully checked in student ${data.userName} for event ${data.eventTitle}!`
      });
      
      // Auto dismiss after 6 seconds
      setTimeout(() => setScanResult(null), 6000);
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.message || 'Error verifying ticket'
      });
    }
  };

  const getApprovedTasksCount = () => {
    return tasks.filter(t => t.status === 'APPROVED').length;
  };

  const getTotalHoursLogged = () => {
    return tasks.reduce((sum, t) => sum + t.hoursWorked, 0);
  };

  const getAverageRating = () => {
    const rated = tasks.filter(t => t.performanceRating !== null);
    if (rated.length === 0) return 'N/A';
    const sum = rated.reduce((sum, t) => sum + (t.performanceRating || 0), 0);
    return (sum / rated.length).toFixed(1);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'hsl(var(--text-muted))' }}>Loading volunteer dashboard...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Dashboard Headers */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Volunteer Portal</h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Check event duties, view admin tasks, and scan attendee tickets</p>
        </div>
        <button onClick={() => setShowScanner(true)} className="btn-primary" style={{ height: '48px', padding: '0 2rem' }}>
          <ScanLine size={20} /> Open Camera Scanner
        </button>
      </header>

      {error && (
        <div style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#f43f5e', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Scanning Result Alert */}
      {scanResult && (
        <div style={{
          background: scanResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)',
          border: scanResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(236, 72, 153, 0.3)',
          color: scanResult.success ? '#10b981' : '#f43f5e',
          padding: '1.25rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {scanResult.success ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700, margin: 0 }}>{scanResult.success ? 'Check-in Verified' : 'Check-in Error'}</h4>
            <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.9rem' }}>{scanResult.message}</p>
          </div>
          <button onClick={() => setScanResult(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Close</button>
        </div>
      )}

      {/* Metrics Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'hsl(var(--accent-indigo))' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <h4 style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', textTransform: 'uppercase' }}>Assigned Duties</h4>
            <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{getApprovedTasksCount()}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(168,85,247,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'hsl(var(--accent-purple))' }}>
            <Clock size={24} />
          </div>
          <div>
            <h4 style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', textTransform: 'uppercase' }}>Hours Approved</h4>
            <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{getTotalHoursLogged().toFixed(1)} hrs</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.75rem', borderRadius: '12px', color: '#f59e0b' }}>
            <Star size={24} />
          </div>
          <div>
            <h4 style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', textTransform: 'uppercase' }}>Duty Rating</h4>
            <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{getAverageRating()}</p>
          </div>
        </div>
      </div>

      {/* Duty Listings */}
      <section>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Assigned Tasks & Schedules
        </h2>

        {tasks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {tasks.map(t => (
              <div key={t.id} className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{t.eventTitle}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', marginTop: '0.2rem' }}>
                      Role: <strong style={{ color: 'hsl(var(--text-primary))' }}>{t.assignedRole}</strong>
                    </p>
                  </div>
                  <span className={`badge badge-${t.status.toLowerCase()}`}>
                    {t.status}
                  </span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', marginBottom: '0.5rem' }}>Task Directives</h4>
                  <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                    {t.assignedTasks}
                  </p>
                </div>

                {t.status === 'APPROVED' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                    <div>
                      Hours worked logged: <strong style={{ color: 'white' }}>{t.hoursWorked.toFixed(1)} hrs</strong>
                    </div>
                    {t.performanceRating && (
                      <div>
                        Admin Performance Rating: <strong style={{ color: '#f59e0b' }}>{t.performanceRating} / 5</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
            No volunteer applications found. Go to the home page, select an upcoming event, and click "Apply as Volunteer".
          </div>
        )}
      </section>

      {/* QR Code Scanner Overlay */}
      {showScanner && (
        <QrScannerModal
          onScan={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};
