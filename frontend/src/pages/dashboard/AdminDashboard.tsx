import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/analytics';
import { eventsApi } from '../../api/events';
import { volunteersApi } from '../../api/volunteers';
import { sponsorsApi } from '../../api/sponsors';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Plus, Trash2, Calendar, Coins, Users, ClipboardList,
  TrendingUp, Check, X, Star
} from 'lucide-react';

interface AnalyticsData {
  totalEvents: number;
  totalRegistrations: number;
  totalCheckIns: number;
  totalVolunteerHours: number;
  totalSponsorshipRevenue: number;
  eventStats: Array<{
    eventTitle: string;
    registrations: number;
    checkIns: number;
    sponsorshipRevenue: number;
    volunteerHours: number;
  }>;
}

interface EventItem {
  id: number;
  title: string;
  location: string;
  startDate: string;
  maxCapacity: number;
  status: string;
}

interface VolunteerItem {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  eventId: number;
  eventTitle: string;
  assignedRole: string;
  assignedTasks: string;
  hoursWorked: number;
  performanceRating: number | null;
  status: string;
}

interface SponsorItem {
  id: number;
  eventId: number;
  eventTitle: string;
  name: string;
  logoUrl: string;
  tier: string;
  contributionAmount: number;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'events' | 'volunteers' | 'sponsors'>('analytics');
  
  // Data state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLoc, setEventLoc] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventCap, setEventCap] = useState(100);
  const [eventStatus, setEventStatus] = useState('UPCOMING');

  // Sponsor Form State
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorLogo, setSponsorLogo] = useState('');
  const [sponsorTier, setSponsorTier] = useState('SILVER');
  const [sponsorEmail, setSponsorEmail] = useState('');
  const [sponsorAmount, setSponsorAmount] = useState(500);
  const [sponsorEventId, setSponsorEventId] = useState<number | ''>('');

  // Volunteer logging state
  const [editingVolId, setEditingVolId] = useState<number | null>(null);
  const [logHours, setLogHours] = useState(0.0);
  const [logRating, setLogRating] = useState(5);

  // Volunteer review state
  const [reviewVolId, setReviewVolId] = useState<number | null>(null);
  const [assignRole, setAssignRole] = useState('');
  const [assignTasks, setAssignTasks] = useState('');

  const CHART_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'analytics') {
        const data = await analyticsApi.getOverview();
        setAnalytics(data);
      } else if (activeTab === 'events') {
        const data = await eventsApi.getAll();
        setEvents(data);
      } else if (activeTab === 'volunteers') {
        const [volData, evData] = await Promise.all([
          volunteersApi.getAdminList(),
          eventsApi.getAll()
        ]);
        setVolunteers(volData);
        setEvents(evData);
      } else if (activeTab === 'sponsors') {
        const [spData, evData] = await Promise.all([
          sponsorsApi.getAll(),
          eventsApi.getAll()
        ]);
        setSponsors(spData);
        setEvents(evData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Event handlers
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
        status: eventStatus
      });

      // Clear Form
      setEventTitle('');
      setEventDesc('');
      setEventLoc('');
      setEventStart('');
      setEventEnd('');
      setEventCap(100);
      setEventStatus('UPCOMING');
      
      loadDashboardData();
      alert('Event created successfully!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event? All associated tickets, check-ins, volunteers, and sponsors will be removed.')) return;
    try {
      await eventsApi.delete(id);
      loadDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting event');
    }
  };

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorEventId) return alert('Select an event for this sponsor');

    try {
      await sponsorsApi.create({
        eventId: Number(sponsorEventId),
        name: sponsorName,
        logoUrl: sponsorLogo,
        tier: sponsorTier,
        contactEmail: sponsorEmail,
        contributionAmount: Number(sponsorAmount)
      });

      setSponsorName('');
      setSponsorLogo('');
      setSponsorTier('SILVER');
      setSponsorEmail('');
      setSponsorAmount(500);
      setSponsorEventId('');

      loadDashboardData();
      alert('Sponsor added successfully!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error adding sponsor');
    }
  };

  const handleDeleteSponsor = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this sponsor?')) return;
    try {
      await sponsorsApi.delete(id);
      loadDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error removing sponsor');
    }
  };

  const handleReviewVolunteer = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await volunteersApi.reviewApplication(id, {
        status,
        assignedRole: assignRole || undefined,
        assignedTasks: assignTasks || undefined
      });
      setReviewVolId(null);
      setAssignRole('');
      setAssignTasks('');
      loadDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error reviewing application');
    }
  };

  const handleLogHoursRating = async (id: number) => {
    try {
      await volunteersApi.logHours(id, {
        hoursWorked: Number(logHours),
        performanceRating: Number(logRating)
      });
      setEditingVolId(null);
      loadDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating log');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Admin Console</h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Configure platform events, audit sponsor assets, review applications, and visualize analytics</p>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '2.5rem' }}>
        {[
          { key: 'analytics', label: 'Dashboard & Charts', icon: <TrendingUp size={16} /> },
          { key: 'events', label: 'Manage Events', icon: <Calendar size={16} /> },
          { key: 'volunteers', label: 'Volunteer Registry', icon: <ClipboardList size={16} /> },
          { key: 'sponsors', label: 'Sponsorships', icon: <Coins size={16} /> }
        ].map(tb => (
          <button
            key={tb.key}
            onClick={() => setActiveTab(tb.key as 'analytics' | 'events' | 'volunteers' | 'sponsors')}
            className={activeTab === tb.key ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
          >
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#f43f5e', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'hsl(var(--text-muted))' }}>Retrieving data records...</div>
      ) : (
        <>
          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && analytics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }} className="animate-fade-in">
              
              {/* Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(99,102,241,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'hsl(var(--accent-indigo))' }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Events</h4>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{analytics.totalEvents}</p>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(168,85,247,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'hsl(var(--accent-purple))' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', textTransform: 'uppercase' }}>Registrations</h4>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{analytics.totalRegistrations}</p>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '12px', color: '#10b981' }}>
                    <Check size={24} />
                  </div>
                  <div>
                    <h4 style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', textTransform: 'uppercase' }}>Check-Ins Done</h4>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{analytics.totalCheckIns}</p>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.75rem', borderRadius: '12px', color: '#f59e0b' }}>
                    <Coins size={24} />
                  </div>
                  <div>
                    <h4 style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', textTransform: 'uppercase' }}>Sponsor Funds</h4>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>${analytics.totalSponsorshipRevenue.toLocaleString()}</p>
                  </div>
                </div>

              </div>

              {/* Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
                
                {/* Bar Chart: Registrations & Check-Ins */}
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '350px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Attendee Engagement Metrics</h3>
                  <div style={{ width: '100%', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.eventStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="eventTitle" stroke="hsl(var(--text-muted))" fontSize={11} />
                        <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="registrations" name="Registered" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="checkIns" name="Checked-in" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart: Sponsorship revenue per event */}
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '350px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Sponsorship Distribution</h3>
                  <div style={{ width: '100%', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.eventStats.filter(e => e.sponsorshipRevenue > 0)}
                          dataKey="sponsorshipRevenue"
                          nameKey="eventTitle"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name }) => name}
                        >
                          {analytics.eventStats.map((_, index) => (
                           <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart: Volunteer hours */}
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '350px', gridColumn: 'span 1' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Volunteer Hours Contributed</h3>
                  <div style={{ width: '100%', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.eventStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="eventTitle" stroke="hsl(var(--text-muted))" fontSize={11} />
                        <YAxis stroke="hsl(var(--text-muted))" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="volunteerHours" name="Hours Worked" stroke="#a855f7" strokeWidth={3} dot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }} className="animate-fade-in">
              {/* Event Creator Form */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={20} /> Create New Event</h3>
                <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Event Title</label>
                    <input type="text" placeholder="Science Fair 2026" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea placeholder="Write event brief details..." value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} required className="form-input" style={{ minHeight: '100px', resize: 'vertical' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue Location</label>
                    <input type="text" placeholder="Engineering Block Seminar Room" value={eventLoc} onChange={(e) => setEventLoc(e.target.value)} required className="form-input" />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Start Time</label>
                      <input type="datetime-local" value={eventStart} onChange={(e) => setEventStart(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">End Time</label>
                      <input type="datetime-local" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} required className="form-input" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Max Seat Capacity</label>
                      <input type="number" min={5} value={eventCap} onChange={(e) => setEventCap(Number(e.target.value))} required className="form-input" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Status Cycle</label>
                      <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value)} className="form-input" style={{ background: 'black' }}>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem', height: '45px' }}>Add Event Launch</button>
                </form>
              </div>

              {/* Event Listings Table */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Active Events Schedule</h3>
                {events.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {events.map(ev => (
                      <div key={ev.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{ev.title}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block', marginTop: '0.1rem' }}>{ev.location} | {formatDate(ev.startDate)}</span>
                        </div>
                        <button onClick={() => handleDeleteEvent(ev.id)} className="btn-secondary" style={{ padding: '0.5rem', border: 'none', color: '#f43f5e' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'hsl(var(--text-muted))' }}>No events added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* VOLUNTEERS TAB */}
          {activeTab === 'volunteers' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={22} style={{ color: 'hsl(var(--accent-purple))' }} /> Volunteer Applications & Ratings Registry
              </h3>

              {volunteers.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--text-muted))' }}>
                        <th style={{ padding: '1rem 0.5rem' }}>Volunteer</th>
                        <th style={{ padding: '1rem 0.5rem' }}>Event Target</th>
                        <th style={{ padding: '1rem 0.5rem' }}>Assigned Duty Role</th>
                        <th style={{ padding: '1rem 0.5rem' }}>Tasks Checklist</th>
                        <th style={{ padding: '1rem 0.5rem' }}>Hours Logged</th>
                        <th style={{ padding: '1rem 0.5rem' }}>Rating</th>
                        <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map(vl => (
                        <tr key={vl.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ fontWeight: 600 }}>{vl.userName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{vl.userEmail}</div>
                          </td>
                          <td style={{ padding: '1rem 0.5rem' }}>{vl.eventTitle}</td>
                          <td style={{ padding: '1rem 0.5rem' }}>{vl.assignedRole || 'N/A'}</td>
                          <td style={{ padding: '1rem 0.5rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={vl.assignedTasks}>
                            {vl.assignedTasks || 'N/A'}
                          </td>
                          <td style={{ padding: '1rem 0.5rem' }}>{vl.hoursWorked.toFixed(1)} hrs</td>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            {vl.performanceRating ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.1rem', color: '#f59e0b', fontWeight: 600 }}>
                                <Star size={12} fill="#f59e0b" /> {vl.performanceRating}
                              </span>
                            ) : (
                              <span style={{ color: 'hsl(var(--text-muted))' }}>Un-rated</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                            {vl.status === 'PENDING' ? (
                              reviewVolId === vl.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', minWidth: '220px' }}>
                                  <input type="text" placeholder="Assign role (e.g. Host)" value={assignRole} onChange={(e) => setAssignRole(e.target.value)} required className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem' }} />
                                  <input type="text" placeholder="Assign tasks..." value={assignTasks} onChange={(e) => setAssignTasks(e.target.value)} required className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem' }} />
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button onClick={() => handleReviewVolunteer(vl.id, 'APPROVED')} className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}><Check size={12} /> Approve</button>
                                    <button onClick={() => handleReviewVolunteer(vl.id, 'REJECTED')} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#f43f5e' }}><X size={12} /> Reject</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => { setReviewVolId(vl.id); setAssignRole(vl.assignedRole || ''); }} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Review Request</button>
                              )
                            ) : vl.status === 'APPROVED' ? (
                              editingVolId === vl.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end', minWidth: '220px' }}>
                                  <input type="number" step="0.5" placeholder="Hours" value={logHours} onChange={(e) => setLogHours(Number(e.target.value))} className="form-input" style={{ width: '70px', padding: '0.4rem', fontSize: '0.8rem' }} />
                                  <select value={logRating} onChange={(e) => setLogRating(Number(e.target.value))} className="form-input" style={{ width: '60px', padding: '0.4rem', fontSize: '0.8rem', background: 'black' }}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}★</option>)}
                                  </select>
                                  <button onClick={() => handleLogHoursRating(vl.id)} className="btn-primary" style={{ padding: '0.4rem', borderRadius: '50%' }}><Check size={12} /></button>
                                  <button onClick={() => setEditingVolId(null)} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}><X size={12} /></button>
                                </div>
                              ) : (
                                <button onClick={() => { setEditingVolId(vl.id); setLogHours(vl.hoursWorked); setLogRating(vl.performanceRating || 5); }} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Log hours / rate</button>
                              )
                            ) : (
                              <span style={{ color: '#f43f5e', fontWeight: 600 }}>Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '2rem' }}>No volunteer registry applications filed.</p>
              )}
            </div>
          )}

          {/* SPONSORS TAB */}
          {activeTab === 'sponsors' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }} className="animate-fade-in">
              
              {/* Sponsor Form */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Coins size={20} style={{ color: '#f59e0b' }} /> Add Event Sponsor</h3>
                <form onSubmit={handleCreateSponsor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Sponsor Company Name</label>
                    <input type="text" placeholder="Microsoft Corp" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand Logo URL (Optional)</label>
                    <input type="text" placeholder="https://logo.clearbit.com/microsoft.com" value={sponsorLogo} onChange={(e) => setSponsorLogo(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sponsor Tier</label>
                    <select value={sponsorTier} onChange={(e) => setSponsorTier(e.target.value)} className="form-input" style={{ background: 'black' }}>
                      <option value="PLATINUM">Platinum Tier</option>
                      <option value="GOLD">Gold Tier</option>
                      <option value="SILVER">Silver Tier</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input type="email" placeholder="sponsor@microsoft.com" value={sponsorEmail} onChange={(e) => setSponsorEmail(e.target.value)} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contribution Amount ($)</label>
                    <input type="number" min={50} value={sponsorAmount} onChange={(e) => setSponsorAmount(Number(e.target.value))} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Event</label>
                    <select value={sponsorEventId} onChange={(e) => setSponsorEventId(e.target.value === '' ? '' : Number(e.target.value))} required className="form-input" style={{ background: 'black' }}>
                      <option value="">-- Choose Event --</option>
                      {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem', height: '45px' }}>Save Sponsor Asset</button>
                </form>
              </div>

              {/* Sponsor Listings Table */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Platform Sponsors</h3>
                {sponsors.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sponsors.map(sp => (
                      <div key={sp.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{sp.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block', marginTop: '0.1rem' }}>
                            {sp.eventTitle} | <strong style={{ color: sp.tier === 'PLATINUM' ? '#fff' : sp.tier === 'GOLD' ? '#f59e0b' : '#94a3b8' }}>{sp.tier}</strong>
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'block', marginTop: '0.2rem' }}>
                            Fund: ${sp.contributionAmount.toLocaleString()}
                          </span>
                        </div>
                        <button onClick={() => handleDeleteSponsor(sp.id)} className="btn-secondary" style={{ padding: '0.5rem', border: 'none', color: '#f43f5e' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'hsl(var(--text-muted))' }}>No sponsors saved yet.</p>
                )}
              </div>

            </div>
          )}

        </>
      )}
    </div>
  );
};
