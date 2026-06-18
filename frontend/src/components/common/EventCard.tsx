import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';

export interface EventData {
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

interface EventCardProps {
  event: EventData;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-active">Active</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">Completed</span>;
      default:
        return <span className="badge badge-upcoming">Upcoming</span>;
    }
  };

  const fillPercent = Math.min(100, (event.registeredCount / event.maxCapacity) * 100);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {getStatusBadge(event.status)}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
          <Users size={14} />
          <span>{event.registeredCount}/{event.maxCapacity}</span>
        </div>
      </div>

      <div style={{ flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{event.title}</h3>
        <p style={{
          color: 'hsl(var(--text-secondary))',
          fontSize: '0.9rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>{event.description}</p>
      </div>

      {/* Capacity Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ height: '6px', background: 'hsl(var(--bg-tertiary))', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${fillPercent}%`,
            background: fillPercent >= 100 
              ? 'linear-gradient(90deg, #ec4899, #f43f5e)' 
              : 'linear-gradient(90deg, #6366f1, #a855f7)',
            borderRadius: '3px',
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)'
          }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={14} style={{ color: 'hsl(var(--accent-indigo))' }} />
          <span>{formatDate(event.startDate)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={14} style={{ color: 'hsl(var(--accent-purple))' }} />
          <span>{event.location}</span>
        </div>
      </div>

      <Link to={`/event/${event.id}`} className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}>
        View Details <ChevronRight size={16} />
      </Link>
    </div>
  );
};
