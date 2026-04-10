import React from 'react';
import { MapPin, Users, Pencil, Trash2 } from 'lucide-react';

/* ── Unsplash images per resource type ── */
const TYPE_META = {
  LECTURE_HALL: {
    icon: '🏛️',
    label: 'Lecture Hall',
    accent: '#1e3a5f',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&auto=format&fit=crop&q=80',
  },
  LAB: {
    icon: '🔬',
    label: 'Lab',
    accent: '#0f766e',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=80',
  },
  MEETING_ROOM: {
    icon: '🤝',
    label: 'Meeting Room',
    accent: '#7c3aed',
    image: 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=500&auto=format&fit=crop&q=80',
  },
  EQUIPMENT: {
    icon: '📦',
    label: 'Equipment',
    accent: '#b45309',
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500&auto=format&fit=crop&q=80',
  },
};

const STATUS_BADGE = {
  ACTIVE: {
    label: 'Active',
    bg: 'rgba(16, 185, 129, 0.15)',
    color: '#059669',
    dot: '#10b981',
  },
  OUT_OF_SERVICE: {
    label: 'Out of Service',
    bg: 'rgba(239, 68, 68, 0.12)',
    color: '#dc2626',
    dot: '#ef4444',
  },
};

/**
 * ResourceCard — premium campus-themed card with image, type badge, 
 * status pill, and edit/delete actions.
 * 
 * Deliberately avoids any `transform`, `z-index`, or `filter` CSS on 
 * hover so it never creates a new stacking context that would obscure 
 * the portal modal.
 */
const ResourceCard = ({ resource, onEdit, onDelete }) => {
  const meta = TYPE_META[resource.type] || TYPE_META.EQUIPMENT;
  const statusMeta = STATUS_BADGE[resource.status] || STATUS_BADGE.OUT_OF_SERVICE;
  const capacityPct = Math.min(100, Math.round((resource.capacity / 300) * 100));

  return (
    <div
      style={{
        background: 'var(--rc-bg, #ffffff)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid var(--rc-border, #e5e7eb)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        /* NO transform, NO z-index, NO filter on hover — 
           hover handled via onMouseEnter/Leave on shadow only */
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.15)`;
        e.currentTarget.style.borderColor = meta.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = 'var(--rc-border, #e5e7eb)';
      }}
    >
      {/* ── Image area ── */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
        {resource.image_url ? (
          <img
            src={resource.image_url}
            alt={resource.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback / type image */}
        <div
          style={{
            display: resource.image_url ? 'none' : 'flex',
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${meta.accent}22 0%, ${meta.accent}44 100%)`,
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
          }}
        >
          {/* Show type image as background with fallback emoji */}
          <img
            src={meta.image}
            alt={meta.label}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
          <span style={{ position: 'relative', zIndex: 1, fontSize: '48px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>
            {meta.icon}
          </span>
        </div>

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />

        {/* Type badge — top left */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: meta.accent,
          color: '#fff',
          borderRadius: '8px',
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.02em',
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
        </div>

        {/* Status badge — top right */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: statusMeta.bg,
          color: statusMeta.color,
          border: `1px solid ${statusMeta.color}44`,
          backdropFilter: 'blur(4px)',
          borderRadius: '99px',
          padding: '4px 10px',
          fontSize: '11px',
          fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: statusMeta.dot,
            display: 'inline-block',
            animation: resource.status === 'ACTIVE' ? 'pulse 2s infinite' : 'none',
          }} />
          {statusMeta.label}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Name */}
        <h3 style={{
          margin: 0,
          fontSize: '17px',
          fontWeight: 700,
          color: 'var(--rc-text, #0f172a)',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
          title={resource.name}
        >
          {resource.name}
        </h3>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--rc-sub, #64748b)', fontSize: '13px' }}>
          <MapPin size={13} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {resource.location}
          </span>
        </div>

        {/* Capacity bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--rc-sub, #64748b)' }}>
              <Users size={12} /> Capacity
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: meta.accent }}>
              {resource.capacity} seats
            </span>
          </div>
          <div style={{ height: '4px', background: 'var(--rc-bar-bg, #e5e7eb)', borderRadius: '99px' }}>
            <div style={{
              height: '100%',
              width: `${capacityPct}%`,
              borderRadius: '99px',
              background: `linear-gradient(90deg, ${meta.accent}, ${meta.accent}bb)`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Availability */}
        {resource.availability && (
          <div style={{ fontSize: '12px', color: 'var(--rc-sub, #64748b)', padding: '5px 10px', background: 'var(--rc-chip-bg, #f1f5f9)', borderRadius: '6px' }}>
            🕐 {resource.availability}
          </div>
        )}
      </div>

      {/* ── Footer / Actions ── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 18px 16px',
        borderTop: '1px solid var(--rc-border, #e5e7eb)',
      }}>
        <button
          onClick={() => onEdit(resource)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px',
            borderRadius: '8px',
            border: `1.5px solid ${meta.accent}`,
            background: 'transparent',
            color: meta.accent,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = meta.accent;
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = meta.accent;
          }}
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(resource)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px',
            borderRadius: '8px',
            border: '1.5px solid #fca5a5',
            background: 'transparent',
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#dc2626';
          }}
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
