import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Layout } from '@/components/layout/Layout';
import { resourceService } from '@/services/resourceService';
import ResourceCard from '@/components/ui/resource-card';
import { LoadingSpinner } from '@/components/common/Spinner';
import { Building2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

/* ──────────────────────────────────────────────
   Shared field / label styles
────────────────────────────────────────────── */
const inputCls =
  'w-full border border-[#e5e7eb] rounded-lg px-[14px] py-[10px] text-[15px] bg-[#f9fafb] text-[#111827] ' +
  'focus:outline-none focus:border-[#1e3a5f] transition-all duration-200 ease-in-out';

const labelCls = 'block text-[#374151] font-semibold text-[14px] mb-[6px]';

/* ──────────────────────────────────────────────
   RESOURCE MODAL  
   Uses ReactDOM.createPortal → renders directly 
   on document.body so no parent stacking context 
   can obscure it.
────────────────────────────────────────────── */
const ResourceModal = ({ open, onClose, onSubmit, formData, setFormData, editMode, submitting }) => {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const dropdownStyle = {
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231e3a5f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '40px',
  };

  const modal = (
    /* ── Overlay ──
       position:fixed, covers entire viewport,
       z-index:9999 beats everything including
       bauhaus cards (z-index:555) and sidebar    */
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'rgba(0,0,0,0.60)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Modal box ──
          z-index:10000 sits above the overlay     */}
      <div
        style={{
          position: 'relative',
          zIndex: 10000,
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
          padding: '24px 28px 20px',
          position: 'relative',
          flexShrink: 0,
        }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '22px', margin: '0 0 8px 0' }}>
            {editMode ? '✏️ Edit Resource' : '➕ Add New Resource'}
          </h2>
          {/* Orange accent line */}
          <div style={{ height: '3px', width: '60px', background: '#f97316', borderRadius: '99px' }} />
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '18px', right: '18px',
              background: 'rgba(255,255,255,0.15)',
              border: 'none', borderRadius: '8px',
              width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <X size={18} color="#fff" />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <form
            id="resource-form"
            onSubmit={onSubmit}
            style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            {/* Name */}
            <div>
              <label className={labelCls}>Name <span style={{ color: '#f97316' }}>*</span></label>
              <input
                className={inputCls}
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="e.g. Main Lecture Hall A"
                required
                style={{ borderLeft: undefined }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30,58,95,0.15), -4px 0 0 0 #f97316')}
                onBlur={(e) => (e.currentTarget.style.boxShadow = '')}
              />
            </div>

            {/* Type + Capacity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className={labelCls}>Type <span style={{ color: '#f97316' }}>*</span></label>
                <select
                  className={inputCls}
                  style={dropdownStyle}
                  value={formData.type}
                  onChange={handleChange('type')}
                  required
                >
                  <option value="LECTURE_HALL">🏛️ Lecture Hall</option>
                  <option value="LAB">🔬 Lab</option>
                  <option value="MEETING_ROOM">🤝 Meeting Room</option>
                  <option value="EQUIPMENT">📦 Equipment</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Capacity <span style={{ color: '#f97316' }}>*</span></label>
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange('capacity')}
                  placeholder="e.g. 120"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className={labelCls}>Location <span style={{ color: '#f97316' }}>*</span></label>
              <input
                className={inputCls}
                value={formData.location}
                onChange={handleChange('location')}
                placeholder="e.g. Block C, Floor 2"
                required
              />
            </div>

            {/* Availability */}
            <div>
              <label className={labelCls}>Availability <span style={{ color: '#f97316' }}>*</span></label>
              <input
                className={inputCls}
                value={formData.availability}
                onChange={handleChange('availability')}
                placeholder="e.g. Mon-Fri 8AM-6PM"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className={labelCls}>Status <span style={{ color: '#f97316' }}>*</span></label>
              <select
                className={inputCls}
                style={dropdownStyle}
                value={formData.status}
                onChange={handleChange('status')}
              >
                <option value="ACTIVE">✅ Active</option>
                <option value="OUT_OF_SERVICE">🔴 Out of Service</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                className={inputCls}
                rows={3}
                value={formData.description}
                onChange={handleChange('description')}
                placeholder="Short description of the resource..."
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Image URL */}
            <div>
              <label className={labelCls}>
                Image URL{' '}
                <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '12px' }}>(optional)</span>
              </label>
              <input
                className={inputCls}
                value={formData.image_url}
                onChange={handleChange('image_url')}
                placeholder="https://..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: '1.5px solid #d1d5db', background: '#fff', color: '#374151',
              borderRadius: '8px', padding: '10px 24px',
              fontWeight: 500, cursor: 'pointer', fontSize: '14px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="resource-form"
            disabled={submitting}
            style={{
              background: submitting ? '#9ca3af' : 'linear-gradient(135deg, #f97316 0%, #ea6c0a 100%)',
              color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px 28px',
              fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              boxShadow: submitting ? 'none' : '0 4px 12px rgba(249,115,22,0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ea6c0a 0%, #d45e00 100%)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea6c0a 100%)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {submitting ? 'Saving...' : editMode ? '✓ Update Resource' : '✓ Save Resource'}
          </button>
        </div>
      </div>
    </div>
  );

  // ← KEY FIX: render directly into document.body
  return ReactDOM.createPortal(modal, document.body);
};

/* ──────────────────────────────────────────────
   DELETE CONFIRM MODAL (also portal-based)
────────────────────────────────────────────── */
const DeleteModal = ({ open, resource, onClose, onConfirm }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open || !resource) return null;

  return ReactDOM.createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'relative', zIndex: 10000,
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          maxWidth: '420px', width: '100%',
          padding: '32px', textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: '#fef2f2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 18px',
        }}>
          <span style={{ fontSize: '26px' }}>🗑️</span>
        </div>
        <h3 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
          Delete Resource
        </h3>
        <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: '#0f172a' }}>"{resource.name}"</strong>?
          {' '}This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 20px', borderRadius: '8px',
              border: '1.5px solid #d1d5db', background: '#fff',
              color: '#374151', fontWeight: 500, cursor: 'pointer',
              fontSize: '14px', transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px 20px', borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff', fontWeight: 600, cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(220,38,38,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ──────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: '',
  location: '',
  availability: 'Mon-Fri 8AM-6PM',
  status: 'ACTIVE',
  description: '',
  image_url: '',
};

export const ResourceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      const data = await resourceService.getAll();
      setResources(data);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editMode) {
        await resourceService.update(selectedResource.resource_id, {
          ...formData, capacity: parseInt(formData.capacity),
        });
        toast.success('Resource updated successfully');
      } else {
        await resourceService.create({
          ...formData, capacity: parseInt(formData.capacity),
        });
        toast.success('Resource created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchResources();
    } catch {
      toast.error('Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity.toString(),
      location: resource.location,
      availability: resource.availability,
      status: resource.status,
      description: resource.description || '',
      image_url: resource.image_url || '',
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDeleteClick = (resource) => {
    setSelectedResource(resource);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await resourceService.delete(selectedResource.resource_id);
      toast.success('Resource deleted successfully');
      setDeleteOpen(false);
      setSelectedResource(null);
      fetchResources();
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditMode(false);
    setSelectedResource(null);
  };

  if (loading) {
    return (
      <Layout pageTitle="Resource Management">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Resource Management">
      <style>{`
        :root {
          --rc-bg: #ffffff;
          --rc-border: #e5e7eb;
          --rc-text: #0f172a;
          --rc-sub: #64748b;
          --rc-bar-bg: #e5e7eb;
          --rc-chip-bg: #f1f5f9;
        }
        .dark {
          --rc-bg: #1e293b;
          --rc-border: #334155;
          --rc-text: #f1f5f9;
          --rc-sub: #94a3b8;
          --rc-bar-bg: #334155;
          --rc-chip-bg: #0f172a;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Resource Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {resources.length} resource{resources.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setDialogOpen(true); }}
            data-testid="add-resource-btn"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.55)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.4)')}
          >
            <Plus size={16} /> Add Resource
          </button>
        </div>

        {/* Cards grid — no z-index, no transform */}
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400 dark:text-slate-600">
            <Building2 className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-semibold">No resources yet</p>
            <p className="text-sm mt-1">Click "Add Resource" to create the first one.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
              /* No position, no z-index, no transform */
            }}
          >
            {resources.map((resource) => (
              <ResourceCard
                key={resource.resource_id}
                resource={resource}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal — portal-based, z-index 9999/10000 */}
      <ResourceModal
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); resetForm(); }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editMode={editMode}
        submitting={submitting}
      />

      {/* Delete confirm modal — also portal-based */}
      <DeleteModal
        open={deleteOpen}
        resource={selectedResource}
        onClose={() => { setDeleteOpen(false); setSelectedResource(null); }}
        onConfirm={handleDeleteConfirm}
      />
    </Layout>
  );
};