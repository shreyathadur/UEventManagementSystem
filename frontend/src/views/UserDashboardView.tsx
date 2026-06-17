import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE, getAuthHeaders } from '../config';
import { Ticket, Award, Download, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

interface TicketData {
  id: number;
  userId: number;
  userName: string;
  eventId: number;
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
  ticketCode: string;
  checkedIn: boolean;
  checkInTime: string | null;
}

interface CertificateData {
  id: number;
  userId: number;
  userName: string;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  certificateCode: string;
  role: string;
  issuedAt: string;
}

export const UserDashboardView: React.FC = () => {
  useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingEventId, setClaimingEventId] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [ticketsRes, certsRes] = await Promise.all([
        fetch(`${API_BASE}/tickets/my`, { headers }),
        fetch(`${API_BASE}/certificates/my`, { headers })
      ]);

      if (!ticketsRes.ok || !certsRes.ok) {
        throw new Error('Failed to load dashboard records');
      }

      const ticketsData = await ticketsRes.json();
      const certsData = await certsRes.json();
      
      setTickets(ticketsData);
      setCertificates(certsData);
      
      if (ticketsData.length > 0 && !selectedTicket) {
        setSelectedTicket(ticketsData[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQr = async (ticketId: number, eventTitle: string) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/qrcode`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_Ticket_${eventTitle.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download QR code image", e);
    }
  };

  const handleClaimCertificate = async (eventId: number) => {
    setClaimingEventId(eventId);
    try {
      const res = await fetch(`${API_BASE}/certificates/claim?eventId=${eventId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Certificate claim failed');
      }

      // Refresh certificates list
      const certsRes = await fetch(`${API_BASE}/certificates/my`, { headers: getAuthHeaders() });
      if (certsRes.ok) {
        setCertificates(await certsRes.json());
      }
      alert('Certificate generated and claimed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to claim certificate. Ensure you have checked-in and attended.');
    } finally {
      setClaimingEventId(null);
    }
  };

  const isCertificateClaimed = (eventId: number) => {
    return certificates.some(c => c.eventId === eventId);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'hsl(var(--text-muted))' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Student Portal</h1>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Manage your event registrations, active QR tickets, and certificate claims</p>
      </header>

      {error && (
        <div style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#f43f5e', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        
        {/* Left: Registered Tickets */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ticket size={22} style={{ color: 'hsl(var(--accent-indigo))' }} /> My Event Tickets
          </h2>

          {tickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tickets.map(tk => (
                <div
                  key={tk.id}
                  onClick={() => setSelectedTicket(tk)}
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    borderColor: selectedTicket?.id === tk.id ? 'hsl(var(--accent-indigo))' : 'rgba(255,255,255,0.06)',
                    background: selectedTicket?.id === tk.id ? 'rgba(99, 102, 241, 0.08)' : 'var(--glass-bg)',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{tk.eventTitle}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                    <span>{formatDate(tk.eventDate)}</span>
                    {tk.checkedIn ? (
                      <span style={{ color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={12} /> Checked In
                      </span>
                    ) : (
                      <span style={{ color: 'hsl(var(--accent-indigo))' }}>Booked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
              You have not registered for any events yet.
              <a href="/" style={{ display: 'block', textDecoration: 'underline', marginTop: '0.75rem', fontWeight: 600, color: 'hsl(var(--accent-indigo))' }}>Find Events</a>
            </div>
          )}
        </div>

        {/* Center: Ticket QR Display & Actions */}
        {selectedTicket && (
          <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', border: '1px solid hsla(var(--accent-indigo), 0.25)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center' }}>{selectedTicket.eventTitle}</h3>
            
            <div style={{
              background: '#fff',
              padding: '1rem',
              borderRadius: '16px',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={`${API_BASE}/tickets/${selectedTicket.id}/qrcode`}
                alt="Ticket QR Code"
                style={{ width: '220px', height: '220px' }}
              />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} /> <span>{formatDate(selectedTicket.eventDate)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} /> <span>{selectedTicket.eventLocation}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <CheckCircle2 size={16} style={{ color: selectedTicket.checkedIn ? '#10b981' : 'hsl(var(--text-muted))' }} />
                <span>Status: {selectedTicket.checkedIn ? `Checked-in at ${formatDate(selectedTicket.checkInTime || '')}` : 'Registered (Un-scanned)'}</span>
              </div>
            </div>

            <button
              onClick={() => handleDownloadQr(selectedTicket.id, selectedTicket.eventTitle)}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              <Download size={16} /> Download PNG Ticket
            </button>

            {selectedTicket.checkedIn && (
              <div style={{ width: '100%' }}>
                {isCertificateClaimed(selectedTicket.eventId) ? (
                  <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <Award size={16} /> Certificate Claimed (See below)
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaimCertificate(selectedTicket.eventId)}
                    disabled={claimingEventId !== null}
                    className="btn-secondary"
                    style={{ width: '100%', borderColor: '#10b981', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)' }}
                  >
                    <Award size={16} /> {claimingEventId === selectedTicket.eventId ? 'Claiming...' : 'Claim Attendance Certificate'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Certificates Section */}
      <section style={{ marginTop: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={24} style={{ color: '#f59e0b' }} /> Claimed Certificates
        </h2>

        {certificates.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {certificates.map(cert => (
              <div key={cert.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Verified {cert.role} Certificate
                  </span>
                  <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>{cert.eventTitle}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Issued on {formatDate(cert.issuedAt)}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                    ID: {cert.certificateCode}
                  </span>
                  <a
                    href={`${API_BASE}/certificates/${cert.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Download size={12} /> Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
            No certificates claimed yet. Certificates will appear here once you check-in at events and claim them.
          </div>
        )}
      </section>
    </div>
  );
};
