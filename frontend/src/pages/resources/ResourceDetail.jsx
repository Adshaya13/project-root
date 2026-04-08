import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { resourceService } from '@/services/resourceService';
import { bookingService } from '@/services/bookingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusPill } from '@/components/common/StatusPill';
import { LoadingSpinner } from '@/components/common/Spinner';
import { Building2, MapPin, Users, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    purpose: '',
    attendees: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const data = await resourceService.getById(id);
      setResource(data);
    } catch (error) {
      toast.error('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (resource.status === 'OUT_OF_SERVICE') {
      toast.error('This resource is currently out of service');
      return;
    }

    setSubmitting(true);
    try {
      await bookingService.create({
        resource_id: resource.resource_id,
        ...bookingData,
        attendees: parseInt(bookingData.attendees),
      });
      toast.success('Booking request submitted! Awaiting admin approval.');
      setBookingOpen(false);
      setBookingData({ date: '', start_time: '', end_time: '', purpose: '', attendees: '' });
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('This resource is already booked for the selected time. Please choose another slot.');
      } else {
        toast.error('Failed to create booking');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Resource Details">
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!resource) {
    return (
      <Layout pageTitle="Resource Details">
        <div className="text-center py-12">
          <p className="text-slate-600">Resource not found</p>
        </div>
      </Layout>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout pageTitle="Resource Details">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/resources')} data-testid="back-btn">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="h-80 bg-gradient-to-br from-slate-100 to-slate-200 relative">
                {resource.image_url ? (
                  <img src={resource.image_url} alt={resource.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="h-32 w-32 text-slate-400" />
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>About this resource</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{resource.description || 'No description available'}</p>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-600" />
                  <span className="text-slate-900">{resource.availability}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>{resource.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <StatusPill status={resource.status} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-sm font-medium">
                      {resource.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-5 w-5" />
                    <span>{resource.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-5 w-5" />
                    <span>Capacity: {resource.capacity} people</span>
                  </div>
                </div>

                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-[#f97316] hover:bg-orange-600 mt-4"
                      disabled={resource.status === 'OUT_OF_SERVICE'}
                      data-testid="book-resource-btn"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book This Resource
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book {resource.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          min={today}
                          value={bookingData.date}
                          onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                          required
                          data-testid="booking-date-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start_time">Start Time *</Label>
                          <Input
                            id="start_time"
                            type="time"
                            value={bookingData.start_time}
                            onChange={(e) => setBookingData({ ...bookingData, start_time: e.target.value })}
                            required
                            data-testid="booking-start-time-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end_time">End Time *</Label>
                          <Input
                            id="end_time"
                            type="time"
                            value={bookingData.end_time}
                            onChange={(e) => setBookingData({ ...bookingData, end_time: e.target.value })}
                            required
                            data-testid="booking-end-time-input"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="attendees">Expected Attendees *</Label>
                        <Input
                          id="attendees"
                          type="number"
                          min="1"
                          max={resource.capacity}
                          value={bookingData.attendees}
                          onChange={(e) => setBookingData({ ...bookingData, attendees: e.target.value })}
                          required
                          data-testid="booking-attendees-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purpose">Purpose *</Label>
                        <Textarea
                          id="purpose"
                          rows={3}
                          value={bookingData.purpose}
                          onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                          required
                          placeholder="Briefly describe the purpose of this booking"
                          data-testid="booking-purpose-input"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setBookingOpen(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="flex-1 bg-[#f97316] hover:bg-orange-600" data-testid="submit-booking-btn">
                          {submitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};