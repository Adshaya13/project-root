import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { resourceService } from '@/services/resourceService';
import { LoadingSpinner } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Building2, MapPin, Users, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ────────────────────────────────────────
   Injected CSS — scoped to this page only
───────────────────────────────────────── */
const PAGE_STYLES = `
/* SPINNING BORDER — disabled
@keyframes border-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}*/
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.5); }
}
@keyframes glow-cycle {
  0%   { box-shadow: 0 0 18px rgba(249,115,22,0.25); }
  25%  { box-shadow: 0 0 18px rgba(30,58,95,0.25); }
  50%  { box-shadow: 0 0 18px rgba(124,58,237,0.25); }
  75%  { box-shadow: 0 0 18px rgba(6,182,212,0.25); }
  100% { box-shadow: 0 0 18px rgba(249,115,22,0.25); }
}

/* ─── Theme tokens ─── */
:root {
  --br-page-bg: linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%);
  --br-panel-bg: rgba(255,255,255,0.86);
  --br-panel-border: rgba(30,58,95,0.16);
  --br-input-bg: #ffffff;
  --br-input-text: #0f172a;
  --br-input-placeholder: #64748b;
  --br-card-bg: #ffffff;
  --br-card-image-bg: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  --br-card-title: #0f172a;
  --br-card-meta: #475569;
  --br-count: #475569;
}

.dark {
  --br-page-bg: linear-gradient(135deg, #0a0a15 0%, #0f1629 50%, #0a0a15 100%);
  --br-panel-bg: rgba(15,15,26,0.85);
  --br-panel-border: rgba(249,115,22,0.2);
  --br-input-bg: #1a1a2e;
  --br-input-text: #ffffff;
  --br-input-placeholder: #64748b;
  --br-card-bg: #0f0f1a;
  --br-card-image-bg: linear-gradient(135deg, #1a1a2e, #0f1629);
  --br-card-title: #ffffff;
  --br-card-meta: #94a3b8;
  --br-count: #94a3b8;
}

/* ─── Page wrapper ─── */
.br-page {
  min-height: 100%;
  background: var(--br-page-bg);
  padding: 24px;
  border-radius: 12px;
}

/* ─── Filter bar ─── */
.br-filter-bar {
  background: var(--br-panel-bg);
  border: 1px solid var(--br-panel-border);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 28px;
  backdrop-filter: blur(12px);
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 14px;
  align-items: center;
}
@media (max-width: 768px) {
  .br-filter-bar { grid-template-columns: 1fr; }
}

/* Search input — styled like the navbar glowing search */
.br-search-wrap {
  position: relative;
}
.br-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
  transition: color 0.2s ease;
}
.br-search-wrap:focus-within .br-search-icon { color: #f97316; }
.br-search-input {
  width: 100%;
  background: var(--br-input-bg);
  border: 1px solid rgba(249,115,22,0.3);
  border-radius: 10px;
  padding: 10px 14px 10px 42px;
  font-size: 14px;
  color: var(--br-input-text);
  outline: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  font-family: inherit;
}
.br-search-input::placeholder { color: var(--br-input-placeholder); }
.br-search-input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
}

/* Dark custom select dropdowns */
.br-select-wrap {
  position: relative;
  min-width: 160px;
}
.br-select {
  appearance: none;
  width: 100%;
  background: var(--br-input-bg);
  border: 1px solid rgba(249,115,22,0.3);
  border-radius: 10px;
  padding: 10px 38px 10px 14px;
  font-size: 14px;
  color: var(--br-input-text);
  outline: none;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.br-select:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
}
.br-select option { background: var(--br-input-bg); color: var(--br-input-text); }
.br-select-chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #f97316;
}

.br-count {
  color: var(--br-count);
  font-size: 13px;
  white-space: nowrap;
}
.br-count strong { color: #f97316; }

/* ─── Card grid ─── */
.br-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 1024px) { .br-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .br-grid { grid-template-columns: 1fr; } }

/* ─── Individual resource card ─── */
.br-card-outer {
  position: relative;
  border-radius: 18px;
  padding: 2px;
  cursor: pointer;
  animation: glow-cycle 4s linear infinite;
  transition: transform 0.3s ease, animation-duration 0.3s ease;
}
.br-card-outer:hover {
  transform: translateY(-4px);
  animation: none;
  box-shadow:
    0 0 30px rgba(249,115,22,0.45),
    0 0 60px rgba(30,58,95,0.25);
}
.br-card-inner {
  background: var(--br-card-bg);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Image zone */
.br-card-image {
  position: relative;
  height: 192px;
  background: var(--br-card-image-bg);
  overflow: hidden;
  flex-shrink: 0;
}
.br-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.br-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 60%, #0f0f1a);
  pointer-events: none;
}
.br-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  border-radius: 99px;
  padding: 4px 11px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
  backdrop-filter: blur(6px);
}
.br-status-active {
  background: rgba(34,197,94,0.15);
  border: 1px solid rgba(34,197,94,0.4);
  color: #22c55e;
}
.br-status-inactive {
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.4);
  color: #ef4444;
}
.br-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.br-dot-green {
  background: #22c55e;
  animation: pulse-dot 2s ease-in-out infinite;
}
.br-dot-red {
  background: #ef4444;
}

/* Card body */
.br-card-body {
  padding: 18px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.br-card-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--br-card-title);
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.br-type-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(249,115,22,0.12);
  border: 1px solid rgba(249,115,22,0.35);
  color: #f97316;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.br-meta-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--br-card-meta);
}
.br-meta-icon {
  color: #f97316;
  flex-shrink: 0;
}

/* Footer buttons */
.br-card-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 20px 20px;
}
.br-btn-primary {
  padding: 10px;
  border-radius: 9px;
  border: none;
  background: #f97316;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(249,115,22,0.35);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
}
.br-btn-primary:hover:not(:disabled) {
  background: #ea6c0a;
  box-shadow: 0 6px 25px rgba(249,115,22,0.55);
}
.br-btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}
.br-btn-outline {
  padding: 10px;
  border-radius: 9px;
  border: 1px solid rgba(249,115,22,0.45);
  background: transparent;
  color: #f97316;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  font-family: inherit;
}
.br-btn-outline:hover {
  background: rgba(249,115,22,0.1);
  border-color: rgba(249,115,22,0.7);
}
`;

function injectBrStyles() {
  if (typeof window === 'undefined') return;
  if (!document.getElementById('br-page-styles')) {
    const s = document.createElement('style');
    s.id = 'br-page-styles';
    s.innerHTML = PAGE_STYLES;
    document.head.appendChild(s);
  }
}

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
};

export const BrowseResources = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [filters, setFilters] = useState({ type: 'ALL', status: 'ALL', search: '' });

  useEffect(() => {
    injectBrStyles();
  }, []);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, resources]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchResources();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  const fetchResources = async () => {
    try {
      const data = await resourceService.getAll();
      setResources(data);
      setFilteredResources(data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...resources];

    if (filters.type !== 'ALL') {
      filtered = filtered.filter((r) => r.type === filters.type);
    }

    if (filters.status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (r) =>
          (r.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
          (r.location || '').toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  if (loading) {
    return (
      <Layout pageTitle="Browse Resources">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Browse Resources">
      <div className="br-page">
        <div className="br-filter-bar">
          <div className="br-search-wrap">
            <Search size={16} className="br-search-icon" />
            <input
              className="br-search-input"
              placeholder="Search resources..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              data-testid="search-input"
            />
          </div>

          <div className="br-select-wrap">
            <select
              className="br-select"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              data-testid="type-filter"
            >
              <option value="ALL">All Types</option>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Lab</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
            <ChevronDown size={15} className="br-select-chevron" />
          </div>

          <div className="br-select-wrap">
            <select
              className="br-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              data-testid="status-filter"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
            <ChevronDown size={15} className="br-select-chevron" />
          </div>

          <div className="br-count">
            <strong>{filteredResources.length}</strong> resources found
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No resources found"
            description="Try adjusting your filters or search query"
          />
        ) : (
          <div className="br-grid">
            {filteredResources.map((resource) => {
              const isActive = resource.status === 'ACTIVE';
              const resourceId = resource.id || resource.resource_id;
              const resourceType = resource.type || 'UNKNOWN';
              const resourceTypeLabel = TYPE_LABELS[resourceType] || resourceType.replaceAll('_', ' ');

              return (
                <div
                  key={resourceId}
                  className="br-card-outer"
                  onClick={() => navigate(`/resources/${resourceId}`)}
                  data-testid={`resource-card-${resourceId}`}
                >
                  <div className="br-card-inner">
                    <div className="br-card-image">
                      {resource.imageUrl ? (
                        <img src={resource.imageUrl} alt={resource.name} />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Building2 style={{ width: '64px', height: '64px', color: '#334155' }} />
                        </div>
                      )}

                      <div className="br-image-overlay" />

                      <div className={`br-status-badge ${isActive ? 'br-status-active' : 'br-status-inactive'}`}>
                        <span className={`br-dot ${isActive ? 'br-dot-green' : 'br-dot-red'}`} />
                        {isActive ? 'ACTIVE' : 'OUT OF SERVICE'}
                      </div>
                    </div>

                    <div className="br-card-body">
                      <h3 className="br-card-name" title={resource.name}>
                        {resource.name || 'Unnamed Resource'}
                      </h3>

                      <div>
                        <span className="br-type-badge">
                          {resourceTypeLabel}
                        </span>
                      </div>

                      <div className="br-meta-row">
                        <MapPin size={14} className="br-meta-icon" />
                        {resource.location || 'Location not specified'}
                      </div>

                      <div className="br-meta-row">
                        <Users size={14} className="br-meta-icon" />
                        Capacity: {resource.capacity ?? 'N/A'}
                      </div>
                    </div>

                    <div className="br-card-footer">
                      <button
                        className="br-btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/resources/${resourceId}`, { state: { autoOpenBooking: true } });
                        }}
                        disabled={resource.status !== 'ACTIVE'}
                        data-testid={`book-now-btn-${resourceId}`}
                      >
                        Book Now
                      </button>

                      <button
                        className="br-btn-outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/resources/${resourceId}`);
                        }}
                        data-testid={`view-details-btn-${resourceId}`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};