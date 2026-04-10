import React, { useEffect, useRef } from 'react';
import { MapPin, Users, Pencil, Trash2 } from 'lucide-react';

/* ── Unsplash images per resource type (UNCHANGED) ── */
const TYPE_META = {
  LECTURE_HALL: {
    icon: '🏛️',
    label: 'Lecture Hall',
    accent: '#1e6ef6',
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
    accent: '#f97316',
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500&auto=format&fit=crop&q=80',
  },
};

const STATUS_BADGE = {
  ACTIVE: {
    label: 'Active',
    bg: 'rgba(16, 185, 129, 0.18)',
    color: '#34d399',
    dot: '#10b981',
  },
  OUT_OF_SERVICE: {
    label: 'Out of Service',
    bg: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    dot: '#ef4444',
  },
};

/* ─────────────────────────────────────────────────────────
   Bauhaus-style CSS injected once into <head>
   Key trick: gradient border via background-clip that
   rotates as the mouse moves — NO z-index set.
───────────────────────────────────────────────────────── */
const RC_STYLES = `
.rc-bauhaus {
  position: relative;
  border-radius: 20px;
  border: 2px solid transparent;
  --rc-rotation: 4.2rad;
  background-image:
    linear-gradient(var(--bauhaus-card-bg, #151419), var(--bauhaus-card-bg, #151419)),
    linear-gradient(calc(var(--rc-rotation, 4.2rad)),
      var(--rc-accent, #1e6ef6) 0%,
      var(--bauhaus-card-bg, #151419) 30%,
      transparent 80%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  box-shadow: 1px 12px 25px rgba(0,0,0,0.55);
  transition: box-shadow 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
}
.rc-bauhaus:hover {
  box-shadow: 2px 18px 40px rgba(0,0,0,0.75);
}

/* image area clips cleanly inside rounded card */
.rc-bauhaus-image {
  position: relative;
  height: 180px;
  width: 100%;
  flex-shrink: 0;
  overflow: hidden;
}

/* body area */
.rc-bauhaus-body {
  padding: 16px 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rc-bauhaus-name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--bauhaus-card-inscription-main, #f0f0f1);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rc-bauhaus-location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--bauhaus-card-inscription-sub, #a0a1b3);
  font-size: 13px;
}
.rc-bauhaus-cap-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--bauhaus-card-inscription-progress-label, #b4c7e7);
}
.rc-bauhaus-cap-bar-track {
  height: 4px;
  background: var(--bauhaus-card-progress-bar-bg, #363636);
  border-radius: 99px;
}
.rc-bauhaus-cap-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}
.rc-bauhaus-avail {
  font-size: 12px;
  color: var(--bauhaus-card-inscription-sub, #a0a1b3);
  padding: 5px 10px;
  background: rgba(255,255,255,0.06);
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
}

/* footer */
.rc-bauhaus-footer {
  display: flex;
  gap: 8px;
  padding: 12px 18px 16px;
  border-top: 1px solid var(--bauhaus-card-separator, #2F2B2A);
}

/* Chronicle-style 3-D flip buttons */
.rc-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  line-height: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.35s linear, color 0.35s linear, border-color 0.35s linear;
  position: relative;
}
.rc-btn span {
  position: relative;
  display: block;
  perspective: 100px;
}
.rc-btn span:nth-of-type(2) { position: absolute; }
.rc-btn em {
  font-style: normal;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  will-change: transform, opacity;
  transition: transform 0.5s cubic-bezier(.645,.045,.355,1), opacity 0.3s linear 0.15s;
}
.rc-btn span:nth-of-type(1) em { transform-origin: top; }
.rc-btn span:nth-of-type(2) em {
  opacity: 0;
  transform: rotateX(-90deg) scaleX(.9) translate3d(0,8px,0);
  transform-origin: bottom;
}
.rc-btn:hover span:nth-of-type(1) em {
  opacity: 0;
  transform: rotateX(90deg) scaleX(.9) translate3d(0,-8px,0);
}
.rc-btn:hover span:nth-of-type(2) em {
  opacity: 1;
  transform: rotateX(0deg) scaleX(1) translateZ(0);
  transition: transform 0.65s cubic-bezier(.645,.045,.355,1), opacity 0.3s linear 0.2s;
}
`;

function injectRcStyles() {
  if (typeof window === 'undefined') return;
  if (!document.getElementById('rc-bauhaus-styles')) {
    const s = document.createElement('style');
    s.id = 'rc-bauhaus-styles';
    s.innerHTML = RC_STYLES;
    document.head.appendChild(s);
  }
}

/**
 * ResourceCard — Bauhaus-styled card that wraps all original content
 * (image, badges, name, location, capacity bar, availability, actions).
 * 
 * The gradient border rotates to follow the mouse exactly like BauhausCard.
 * No z-index is set — safe for use alongside portal-based modals.
 */
const ResourceCard = ({ resource, onEdit, onDelete }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    injectRcStyles();
    const card = cardRef.current;
    const onMove = (e) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.setProperty('--rc-rotation', Math.atan2(-x, y) + 'rad');
    };
    card?.addEventListener('mousemove', onMove);
    return () => card?.removeEventListener('mousemove', onMove);
  }, []);

  const meta = TYPE_META[resource.type] || TYPE_META.EQUIPMENT;
  const statusMeta = STATUS_BADGE[resource.status] || STATUS_BADGE.OUT_OF_SERVICE;
  const capacityPct = Math.min(100, Math.round((resource.capacity / 300) * 100));

  return (
    <div
      ref={cardRef}
      className="rc-bauhaus"
      style={{ '--rc-accent': meta.accent }}
    >
      {/* ── Image area (UNCHANGED content) ── */}
      <div className="rc-bauhaus-image">
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

        {/* Fallback type image (UNCHANGED content) */}
        <div
          style={{
            display: resource.image_url ? 'none' : 'flex',
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${meta.accent}22 0%, ${meta.accent}44 100%)`,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img
            src={meta.image}
            alt={meta.label}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
          <span style={{ position: 'relative', zIndex: 1, fontSize: '48px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
            {meta.icon}
          </span>
        </div>

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />

        {/* Type badge — top left (UNCHANGED content) */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: meta.accent, color: '#fff',
          borderRadius: '8px', padding: '4px 10px',
          fontSize: '12px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
        </div>

        {/* Status badge — top right (UNCHANGED content) */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: statusMeta.bg, color: statusMeta.color,
          border: `1px solid ${statusMeta.color}55`,
          backdropFilter: 'blur(6px)',
          borderRadius: '99px', padding: '4px 10px',
          fontSize: '11px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: statusMeta.dot, display: 'inline-block',
          }} />
          {statusMeta.label}
        </div>
      </div>

      {/* ── Body (UNCHANGED content, Bauhaus colors) ── */}
      <div className="rc-bauhaus-body">
        <h3 className="rc-bauhaus-name" title={resource.name}>{resource.name}</h3>

        <div className="rc-bauhaus-location">
          <MapPin size={13} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {resource.location}
          </span>
        </div>

        {/* Capacity bar (UNCHANGED content) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span className="rc-bauhaus-cap-label">
              <Users size={12} /> Capacity
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: meta.accent }}>
              {resource.capacity} seats
            </span>
          </div>
          <div className="rc-bauhaus-cap-bar-track">
            <div
              className="rc-bauhaus-cap-bar-fill"
              style={{
                width: `${capacityPct}%`,
                background: `linear-gradient(90deg, ${meta.accent}, ${meta.accent}aa)`,
              }}
            />
          </div>
        </div>

        {/* Availability (UNCHANGED content) */}
        {resource.availability && (
          <div className="rc-bauhaus-avail">🕐 {resource.availability}</div>
        )}
      </div>

      {/* ── Footer with Chronicle-style flip buttons (UNCHANGED labels) ── */}
      <div className="rc-bauhaus-footer">
        {/* Edit button */}
        <button
          className="rc-btn"
          onClick={() => onEdit(resource)}
          style={{
            border: `1.5px solid ${meta.accent}`,
            background: 'transparent',
            color: meta.accent,
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
          <span><em><Pencil size={12} /> Edit</em></span>
          <span><em><Pencil size={12} /> Edit</em></span>
        </button>

        {/* Delete button */}
        <button
          className="rc-btn"
          onClick={() => onDelete(resource)}
          style={{
            border: '1.5px solid #ef444466',
            background: 'transparent',
            color: '#f87171',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.borderColor = '#ef444466';
          }}
        >
          <span><em><Trash2 size={12} /> Delete</em></span>
          <span><em><Trash2 size={12} /> Delete</em></span>
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
