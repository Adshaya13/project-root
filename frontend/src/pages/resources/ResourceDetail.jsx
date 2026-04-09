import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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
  const [attendeesError, setAttendeesError] = useState('');
  const [timeError, setTimeError] = useState('');

  const isThirtyMinuteSlot = (timeValue) => {
    if (!timeValue || !timeValue.includes(':')) {
      return false;
    }
    const [hours, minutes] = timeValue.split(':').map(Number);
    return Number.isInteger(hours) && Number.isInteger(minutes) && (minutes === 0 || minutes === 30);
  };

  const normalizeToThirtyMinuteSlot = (timeValue) => {
    if (!timeValue || !timeValue.includes(':')) {
      return timeValue;
    }

    const [rawHours, rawMinutes] = timeValue.split(':').map(Number);
    if (!Number.isInteger(rawHours) || !Number.isInteger(rawMinutes)) {
      return timeValue;
    }

    const roundedMinutes = rawMinutes < 15 ? 0 : rawMinutes < 45 ? 30 : 0;
    const hourOffset = rawMinutes >= 45 ? 1 : 0;
    const normalizedHours = (rawHours + hourOffset) % 24;
    return `${normalizedHours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
  };

  const getTimeValidationError = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return '';
    }

    if (!isThirtyMinuteSlot(startTime) || !isThirtyMinuteSlot(endTime)) {
      return 'Start and end times must use 30-minute intervals';
    }

    const toMinutes = (timeValue) => {
      const [hours, minutes] = timeValue.split(':').map(Number);
      return (hours * 60) + minutes;
    };

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      return 'Start time must be earlier than end time';
    }

    return '';
  };

  const getApiErrorMessage = (error) => {
    const responsePayload = error?.response?.data;
    if (!responsePayload) {
      return 'Failed to create booking';
    }

    if (responsePayload.message && responsePayload.message !== 'Validation failed') {
      return responsePayload.message;
    }

    const fieldErrors = responsePayload.data;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const firstError = Object.values(fieldErrors).find((message) => typeof message === 'string' && message.trim());
      if (firstError) {
        return firstError;
      }
    }

    return responsePayload.message || 'Failed to create booking';
  };

  useEffect(() => {
    fetchResource();
  }, [id]);

  useEffect(() => {
    if (location.state?.autoOpenBooking) {
      setBookingOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    setTimeError(getTimeValidationError(bookingData.start_time, bookingData.end_time));
  }, [bookingData.start_time, bookingData.end_time]);

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

    const attendeesCount = parseInt(bookingData.attendees, 10);
    if (Number.isNaN(attendeesCount) || attendeesCount < 1) {
      toast.error('Expected attendees must be a valid number');
      return;
    }

    if (attendeesCount > resource.capacity) {
      const message = `Expected attendees cannot exceed capacity (${resource.capacity})`;
      setAttendeesError(message);
      toast.error(message);
      return;
    }
    setAttendeesError('');

    if (!bookingData.start_time || !bookingData.end_time) {
      const message = 'Please select both start time and end time';
      setTimeError(message);
      toast.error(message);
      return;
    }

    const timeValidationError = getTimeValidationError(bookingData.start_time, bookingData.end_time);
    if (timeValidationError) {
      const message = timeValidationError;
      setTimeError(message);
      toast.error(message);
      return;
    }

    setTimeError('');

    setSubmitting(true);
    try {
      await bookingService.create({
        resource_id: resource.resource_id,
        ...bookingData,
        attendees: attendeesCount,
      });
      toast.success('Booking request submitted! Awaiting admin approval.');
      setBookingOpen(false);
      setBookingData({ date: '', start_time: '', end_time: '', purpose: '', attendees: '' });
      setAttendeesError('');
      setTimeError('');
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('This resource is already booked for the selected time. Please choose another slot.');
      } else {
        toast.error(getApiErrorMessage(error));
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

  const today = new Date();
  const minBookingDate = new Date(today);
  minBookingDate.setDate(today.getDate() + 1);
  const maxBookingDate = new Date(today);
  maxBookingDate.setDate(today.getDate() + 14);
  const minDate = minBookingDate.toISOString().split('T')[0];
  const maxDate = maxBookingDate.toISOString().split('T')[0];

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
                      className="w-full bg-[#1e3a5f] hover:bg-slate-800 mt-4"
                      disabled={resource.status === 'OUT_OF_SERVICE'}
                      data-testid="book-resource-btn"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book This Resource
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    overlayClassName="bg-slate-900/75"
                    className="sm:max-w-md bg-white border border-slate-200 shadow-2xl"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-slate-900">Book {resource.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div>
                        <Label htmlFor="date" className="text-slate-700">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          min={minDate}
                          max={maxDate}
                          value={bookingData.date}
                          onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
                          required
                          data-testid="booking-date-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start_time" className="text-slate-700">Start Time *</Label>
                          <Input
                            id="start_time"
                            type="time"
                            step={1800}
                            value={bookingData.start_time}
                            onChange={(e) => {
                              setBookingData({ ...bookingData, start_time: e.target.value });
                            }}
                            onBlur={(e) => {
                              const normalized = normalizeToThirtyMinuteSlot(e.target.value);
                              if (normalized && normalized !== bookingData.start_time) {
                                setBookingData((prev) => ({ ...prev, start_time: normalized }));
                              }
                            }}
                            className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
                            required
                            data-testid="booking-start-time-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end_time" className="text-slate-700">End Time *</Label>
                          <Input
                            id="end_time"
                            type="time"
                            step={1800}
                            value={bookingData.end_time}
                            onChange={(e) => {
                              setBookingData({ ...bookingData, end_time: e.target.value });
                            }}
                            onBlur={(e) => {
                              const normalized = normalizeToThirtyMinuteSlot(e.target.value);
                              if (normalized && normalized !== bookingData.end_time) {
                                setBookingData((prev) => ({ ...prev, end_time: normalized }));
                              }
                            }}
                            className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
                            required
                            data-testid="booking-end-time-input"
                          />
                        </div>
                      </div>
                      {timeError && <p className="text-xs text-red-600 -mt-2">{timeError}</p>}
                      <p className="text-xs text-slate-500 -mt-2">Use 30-minute intervals (e.g., 09:00, 09:30, 10:00).</p>
                      <div>
                        <Label htmlFor="attendees" className="text-slate-700">Expected Attendees *</Label>
                        <Input
                          id="attendees"
                          type="number"
                          min="1"
                          max={resource.capacity}
                          value={bookingData.attendees}
                          onChange={(e) => {
                            const value = e.target.value;
                            setBookingData({ ...bookingData, attendees: value });
                            const count = parseInt(value, 10);
                            if (!value) {
                              setAttendeesError('');
                            } else if (!Number.isNaN(count) && count > resource.capacity) {
                              setAttendeesError(`Expected attendees cannot exceed capacity (${resource.capacity})`);
                            } else {
                              setAttendeesError('');
                            }
                          }}
                          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
                          required
                          data-testid="booking-attendees-input"
                        />
                        {attendeesError && <p className="text-xs text-red-600 mt-1">{attendeesError}</p>}
                      </div>
                      <div>
                        <Label htmlFor="purpose" className="text-slate-700">Purpose *</Label>
                        <Textarea
                          id="purpose"
                          rows={3}
                          value={bookingData.purpose}
                          onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
                          required
                          placeholder="Briefly describe the purpose of this booking"
                          data-testid="booking-purpose-input"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setBookingOpen(false)} className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting || !!timeError || !!attendeesError} className="flex-1 bg-[#1e3a5f] hover:bg-slate-800" data-testid="submit-booking-btn">
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