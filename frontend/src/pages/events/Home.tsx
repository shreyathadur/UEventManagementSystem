import React, { useState, useEffect } from 'react';
import { EventCard } from '../../components/common/EventCard';
import type { EventData } from '../../components/common/EventCard';
import { eventsApi } from '../../api/events';
import { sponsorsApi } from '../../api/sponsors';
import { Search, SlidersHorizontal, Award } from 'lucide-react';

interface SponsorData {
  id: number;
  name: string;
  logoUrl: string;
  tier: string;
  contributionAmount: number;
}

export const Home: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, sponsorsData] = await Promise.all([
          eventsApi.getAll(),
          sponsorsApi.getAll()
        ]);
        setEvents(eventsData);
        setSponsors(sponsorsData);
      } catch (err) {
        console.error("Failed to fetch home page details: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSponsorsByTier = (tier: string) => {
    return sponsors.filter(s => s.tier === tier);
  };

  return (
    <div style={{ padding: '2rem', position: 'relative', minHeight: '80vh' }}>
      {/* Background Orbs */}
      <div className="orb orb-primary"></div>
      <div className="orb orb-secondary"></div>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', margin: '3rem 0 4rem 0' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }} className="gradient-text">
          University Event Hub
        </h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover upcoming campus fests, register to participate, volunteer for tasks, and claim verified excellence certificates.
        </p>
      </header>

      {/* Filters & Search */}
      <div className="glass-panel" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '1.5rem',
        marginBottom: '3rem',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 300px', display: 'flex', gap: '0.75rem', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} size={20} />
          <input
            type="text"
            placeholder="Search events by name or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '3rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SlidersHorizontal size={18} style={{ color: 'hsl(var(--text-muted))' }} />
          <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Filter Status:</span>
          
          {['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Events Listing */}
      <section style={{ marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Featured Events
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))' }}>Loading events...</div>
        ) : filteredEvents.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
            No events found matching the selection criteria.
          </div>
        )}
      </section>

      {/* Sponsors Showcase */}
      <section className="glass-panel" style={{ padding: '3rem 2rem', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Award size={32} style={{ color: '#f59e0b', margin: '0 auto 0.5rem auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Our Valued Sponsors</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem' }}>Supporting student innovation and campus excellence</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))' }}>Loading sponsors...</div>
        ) : sponsors.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Platinum Sponsors */}
            {getSponsorsByTier('PLATINUM').length > 0 && (
              <div>
                <h4 style={{ color: '#f8fafc', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '1.25rem' }}>Platinum Sponsors</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem' }}>
                  {getSponsorsByTier('PLATINUM').map(sp => (
                    <div key={sp.id} className="glass-card" style={{ padding: '1.25rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '180px' }}>
                      {sp.logoUrl ? (
                        <img src={sp.logoUrl} alt={sp.name} style={{ height: '40px', objectFit: 'contain', filter: 'brightness(0.9) contrast(1.1)' }} />
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{sp.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gold Sponsors */}
            {getSponsorsByTier('GOLD').length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ color: '#f59e0b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '1.25rem' }}>Gold Sponsors</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                  {getSponsorsByTier('GOLD').map(sp => (
                    <div key={sp.id} className="glass-card" style={{ padding: '1rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '150px' }}>
                      {sp.logoUrl ? (
                        <img src={sp.logoUrl} alt={sp.name} style={{ height: '30px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{sp.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Silver Sponsors */}
            {getSponsorsByTier('SILVER').length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '1.25rem' }}>Silver Sponsors</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
                  {getSponsorsByTier('SILVER').map(sp => (
                    <div key={sp.id} className="glass-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '120px' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>{sp.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'hsl(var(--text-muted))' }}>No sponsors added yet for current events.</p>
        )}
      </section>
    </div>
  );
};
