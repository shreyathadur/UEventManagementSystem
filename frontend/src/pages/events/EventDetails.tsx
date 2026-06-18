import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventsApi } from '../../api/events';
import { sponsorsApi } from '../../api/sponsors';
import { ticketsApi } from '../../api/tickets';
import { volunteersApi } from '../../api/volunteers';
import { Calendar, MapPin, Users, Ticket, Award, HandHelping, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface EventData {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  status: string;
  registeredCount: number;
  checkInCount: number;
}

interface SponsorData {
  id: number;
  name: string;
  logoUrl: string;
  tier: string;
}

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<EventData | null>(null);
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [volunteerStatus, setVolunteerStatus] = useState<string | null>(null);
  
  // Volunteer application states
  const [showVolForm, setShowVolForm] = useState(false);
  const [requestedRole, setRequestedRole] = useState('');
  
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!id) return;

        const [eventData, sponsorsData] = await Promise.all([
          eventsApi.getById(id),
          sponsorsApi.getEventSponsors(Number(id))
        ]);
        
        setEvent(eventData);
        setSponsors(sponsorsData);

        // If user is logged in, check if they are registered or have volunteered
        if (isAuthenticated && user) {
          try {
            // Check ticket registrations
            const tickets = await ticketsApi.getMyTickets();
            const registered = tickets.some((t: { eventId: number }) => t.eventId === Number(id));
            setIsRegistered(registered);

            // Check volunteer status
            const volApplications = await volunteersApi.getMyTasks();
            const app = volApplications.find((v: { eventId: number; status: string }) => v.eventId === Number(id));
            if (app) {
              setVolunteerStatus(app.status);
            }
          } catch (e) {
            console.error("Failed to fetch user-specific event details", e);
          }
        }
      } catch (err: unknown) {
        console.error(err);
        setMessage({ text: err instanceof Error ? err.message : 'Failed to load event details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isAuthenticated, user]);

  const handleBookTicket = async () => {
    if (!event) return;
    setSubmitting(true);
    setMessage(null);

    try {
      await ticketsApi.bookTicket(event.id);
      setIsRegistered(true);
      setEvent({ ...event, registeredCount: event.registeredCount + 1 });
      setMessage({ text: 'Registration Successful! Your QR ticket is ready on your dashboard.', type: 'success' });
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Error occurred during registration', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVolunteerApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const data = await volunteersApi.apply(event.id, requestedRole);
      setVolunteerStatus(data.status); // Should be PENDING
      setShowVolForm(false);
      setMessage({ text: 'Volunteer application submitted successfully! Pending admin approval.', type: 'success' });
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'Error submitting volunteer application', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'hsl(var(--text-muted))' }}>Loading event details...</div>;
  }

  if (!event) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Event not found</h2>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--text-secondary))', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Events
      </Link>

      {message && (
        <div style={{
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)',
          border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(236, 72, 153, 0.3)',
          color: message.type === 'success' ? '#10b981' : '#f43f5e',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} /> {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        
        {/* Left Side: Metadata & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <span className={`badge badge-${event.status.toLowerCase()}`} style={{ marginBottom: '1rem' }}>
              {event.status}
            </span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>{event.title}</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Calendar style={{ color: 'hsl(var(--accent-indigo))', marginTop: '0.2rem' }} size={20} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Date & Time</h4>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>{formatDate(event.startDate)}</p>
                  <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>to {formatDate(event.endDate)}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin style={{ color: 'hsl(var(--accent-purple))', marginTop: '0.2rem' }} size={20} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Venue Location</h4>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>{event.location}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Users style={{ color: 'hsl(var(--accent-pink))', marginTop: '0.2rem' }} size={20} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Attendance Limit</h4>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                    {event.registeredCount} registered out of {event.maxCapacity} seats
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!isAuthenticated ? (
                <Link to="/auth" className="btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
                  Login to Register
                </Link>
              ) : user?.role === 'ROLE_ADMIN' ? (
                <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Administrators can manage details from the Admin Portal.
                </div>
              ) : (
                <>
                  {isRegistered ? (
                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', borderColor: 'hsla(var(--accent-emerald), 0.3)' }}>
                      <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} /> Registered for Event
                      </span>
                      <Link to="/dashboard" style={{ display: 'block', fontSize: '0.85rem', marginTop: '0.5rem', textDecoration: 'underline' }}>
                        View Ticket & QR Code
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleBookTicket}
                      disabled={submitting || event.registeredCount >= event.maxCapacity || event.status === 'COMPLETED'}
                      className="btn-primary"
                      style={{ width: '100%' }}
                    >
                      <Ticket size={18} /> 
                      {event.registeredCount >= event.maxCapacity ? 'Event Full' : event.status === 'COMPLETED' ? 'Event Concluded' : 'Register / Book Ticket'}
                    </button>
                  )}

                  {/* Volunteer Action */}
                  {volunteerStatus ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '0.9rem'
                    }}>
                      Volunteer Application Status: <span style={{ 
                        fontWeight: 600, 
                        color: volunteerStatus === 'APPROVED' ? '#10b981' : volunteerStatus === 'REJECTED' ? '#f43f5e' : '#f59e0b'
                      }}>{volunteerStatus}</span>
                      {volunteerStatus === 'APPROVED' && (
                        <Link to="/volunteer" style={{ display: 'block', fontSize: '0.85rem', marginTop: '0.25rem', textDecoration: 'underline' }}>
                          Open Volunteer Portal
                        </Link>
                      )}
                    </div>
                  ) : (
                    event.status !== 'COMPLETED' && (
                      <div style={{ width: '100%' }}>
                        {!showVolForm ? (
                          <button
                            onClick={() => setShowVolForm(true)}
                            className="btn-secondary"
                            style={{ width: '100%' }}
                          >
                            <HandHelping size={18} /> Apply as Volunteer
                          </button>
                        ) : (
                          <form onSubmit={handleVolunteerApply} className="glass-panel animate-fade-in" style={{ padding: '1rem', marginTop: '0.5rem' }}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                              <label className="form-label">Preferred Role (e.g. Check-in, Logistics, Tech Support)</label>
                              <input
                                type="text"
                                placeholder="Check-in Desk Staff"
                                value={requestedRole}
                                onChange={(e) => setRequestedRole(e.target.value)}
                                required
                                className="form-input"
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, padding: '0.5rem' }}>
                                Submit Application
                              </button>
                              <button type="button" onClick={() => setShowVolForm(false)} className="btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )
                  )}
                </>
              )}
            </div>

          </div>
        </div>

        {/* Right Side: Description & Sponsors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Description */}
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About the Event</h2>
            <p style={{
              color: 'hsl(var(--text-secondary))',
              lineHeight: 1.7,
              whiteSpace: 'pre-line'
            }}>{event.description}</p>
          </div>

          {/* Event-Specific Sponsors */}
          {sponsors.length > 0 && (
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} style={{ color: '#f59e0b' }} /> Event Sponsors
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                {sponsors.map(sp => (
                  <div key={sp.id} style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80px',
                    textAlign: 'center'
                  }}>
                    {sp.logoUrl ? (
                      <img src={sp.logoUrl} alt={sp.name} style={{ maxWidth: '80px', maxHeight: '35px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sp.name}</span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: sp.tier === 'PLATINUM' ? '#fff' : sp.tier === 'GOLD' ? '#f59e0b' : '#94a3b8', textTransform: 'uppercase', marginTop: '0.35rem', fontWeight: 700 }}>
                      {sp.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
