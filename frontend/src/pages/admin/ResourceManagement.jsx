import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { resourceService } from '@/services/resourceService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusPill } from '@/components/common/StatusPill';
import { LoadingSpinner } from '@/components/common/Spinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Building2, MapPin, Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const ResourceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: '',
    location: '',
    availability: 'Mon-Fri 8AM-6PM',
    status: 'ACTIVE',
    description: '',
    image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await resourceService.getAll();
      setResources(data);
    } catch (error) {
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
        await resourceService.update(selectedResource.resource_id, { ...formData, capacity: parseInt(formData.capacity) });
        toast.success('Resource updated successfully');
      } else {
        await resourceService.create({ ...formData, capacity: parseInt(formData.capacity) });
        toast.success('Resource created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchResources();
    } catch (error) {
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

  const handleDelete = async () => {
    try {
      await resourceService.delete(selectedResource.resource_id);
      toast.success('Resource deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedResource(null);
      fetchResources();
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'LECTURE_HALL',
      capacity: '',
      location: '',
      availability: 'Mon-Fri 8AM-6PM',
      status: 'ACTIVE',
      description: '',
      image_url: '',
    });
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Resource Management</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#f97316] hover:bg-orange-600" data-testid="add-resource-btn">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editMode ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LECTURE_HALL">Lecture Hall</SelectItem>
                        <SelectItem value="LAB">Lab</SelectItem>
                        <SelectItem value="MEETING_ROOM">Meeting Room</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input id="capacity" type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="availability">Availability *</Label>
                  <Input id="availability" value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} placeholder="e.g., Mon-Fri 8AM-6PM" required />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input id="image_url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1 bg-[#f97316] hover:bg-orange-600">
                    {submitting ? 'Saving...' : editMode ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.resource_id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative">
                {resource.image_url ? (
                  <img src={resource.image_url} alt={resource.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-slate-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusPill status={resource.status} />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{resource.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-medium">{resource.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    {resource.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    Capacity: {resource.capacity}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(resource)} className="flex-1">
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedResource(resource);
                      setDeleteDialogOpen(true);
                    }}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Resource"
          description={`Are you sure you want to delete ${selectedResource?.name}? This action cannot be undone.`}
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </Layout>
  );
};