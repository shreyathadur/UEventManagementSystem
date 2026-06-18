import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventsApi } from '../../api/events';
import { Calendar, MapPin, Users, Plus, Trash2 } from 'lucide-react';

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLoc, setEventLoc] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventCap, setEventCap] = useState(100);
  const [eventCategory, setEventCategory] = useState('Conference');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const allEvents = await eventsApi.getAll();
      // Filter events owned by this organizer
      const myEvents = allEvents.filter((e: any) => e.organizerId === user?.userId);
      setEvents(myEvents);
    } catch (err) {
      console.error("Failed to load organizer events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventsApi.create({
        title: eventTitle,
        description: eventDesc,
        location: eventLoc,
        startDate: eventStart,
        endDate: eventEnd,
        maxCapacity: Number(eventCap),
        status: 'UPCOMING',
        category: eventCategory,
        organizerId: user?.userId
      });

      setEventTitle('');
      setEventDesc('');
      setEventLoc('');
      setEventStart('');
      setEventEnd('');
      setEventCap(100);
      setEventCategory('Conference');
      
      loadDashboardData();
      alert('Event created successfully!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsApi.delete(id);
      loadDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting event');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Organizer Dashboard...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Organizer Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Create Event Form */}
        <div className="glass-panel" style={{ padding: '2rem', boxShadow: 'var(--glass-shadow)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} className="text-accent" /> Create New Event
          </h2>
          <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input type="text" className="form-input" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={eventCategory} onChange={e => setEventCategory(e.target.value)} style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Social">Social</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" value={eventLoc} onChange={e => setEventLoc(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Start Date/Time</label>
                <input type="datetime-local" className="form-input" value={eventStart} onChange={e => setEventStart(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date/Time</label>
                <input type="datetime-local" className="form-input" value={eventEnd} onChange={e => setEventEnd(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Max Capacity</label>
              <input type="number" className="form-input" value={eventCap} onChange={e => setEventCap(Number(e.target.value))} min={1} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={eventDesc} onChange={e => setEventDesc(e.target.value)} required></textarea>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Create Event</button>
          </form>
        </div>

        {/* My Events List */}
        <div className="glass-panel" style={{ padding: '2rem', boxShadow: 'var(--glass-shadow)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} className="text-accent" /> My Hosted Events
          </h2>
          
          {events.length === 0 ? (
            <p style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '2rem 0' }}>
              You haven't created any events yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map(event => (
                <div key={event.id} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '12px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{event.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} /> {new Date(event.startDate).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} /> {event.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Users size={14} /> {event.registeredCount || 0}/{event.maxCapacity}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: '#ef4444', 
                        border: 'none', 
                        padding: '0.5rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer' 
                      }}
                      title="Delete Event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
