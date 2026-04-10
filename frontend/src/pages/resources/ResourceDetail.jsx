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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusPill } from '@/components/common/StatusPill';
import { LoadingSpinner } from '@/components/common/Spinner';
import { Building2, MapPin, Users, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const SLOT_INTERVAL_MINUTES = 30;
const MAX_BOOKING_DURATION_MINUTES = 180;
const OPERATING_START_MINUTES = (7 * 60) + 30;
const OPERATING_END_MINUTES = (20 * 60) + 30;
const LATEST_START_MINUTES = OPERATING_END_MINUTES - SLOT_INTERVAL_MINUTES;
const TIME_TOKEN_PATTERN = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/ig;

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

  const toMinutes = (timeValue) => {
    if (!timeValue || !timeValue.includes(':')) {
      return Number.NaN;
    }
    const [hours, minutes] = timeValue.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
      return Number.NaN;
    }
    return (hours * 60) + minutes;
  };

  const toTimeValue = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const toTimeLabel = (minutes) => {
    const hours24 = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const parseAvailabilityWindow = (availabilityText) => {
    const matches = [];
    const text = String(availabilityText || '');
    TIME_TOKEN_PATTERN.lastIndex = 0;
    let match;

    while ((match = TIME_TOKEN_PATTERN.exec(text)) !== null) {
      const hoursPart = Number(match[1]);
      const minutesPart = match[2] ? Number(match[2]) : 0;
      const period = (match[3] || '').toUpperCase();

      if (!Number.isInteger(hoursPart) || !Number.isInteger(minutesPart) || minutesPart < 0 || minutesPart >= 60) {
        continue;
      }

      if (!period) {
        if (hoursPart < 0 || hoursPart >= 24) {
          continue;
        }
        matches.push((hoursPart * 60) + minutesPart);
        continue;
      }

      if (hoursPart < 1 || hoursPart > 12) {
        continue;
      }

      let normalizedHours = hoursPart % 12;
      if (period === 'PM') {
        normalizedHours += 12;
      }
      matches.push((normalizedHours * 60) + minutesPart);
    }

    if (matches.length >= 2 && matches[1] > matches[0]) {
      return { startMinutes: matches[0], endMinutes: matches[1] };
    }

    return { startMinutes: OPERATING_START_MINUTES, endMinutes: OPERATING_END_MINUTES };
  };

  const availabilityWindow = parseAvailabilityWindow(resource?.availability);

  const startTimeOptions = [];
  const latestAllowedStart = Math.min(
    availabilityWindow.endMinutes - SLOT_INTERVAL_MINUTES,
    OPERATING_END_MINUTES - SLOT_INTERVAL_MINUTES
  );
  for (let minutes = Math.max(availabilityWindow.startMinutes, OPERATING_START_MINUTES); minutes <= latestAllowedStart; minutes += SLOT_INTERVAL_MINUTES) {
    startTimeOptions.push({ value: toTimeValue(minutes), label: toTimeLabel(minutes) });
  }

  const selectedStartMinutes = toMinutes(bookingData.start_time);
  const endTimeOptions = [];
  if (Number.isFinite(selectedStartMinutes)) {
    const minEnd = selectedStartMinutes + SLOT_INTERVAL_MINUTES;
    const maxEnd = Math.min(
      selectedStartMinutes + MAX_BOOKING_DURATION_MINUTES,
      availabilityWindow.endMinutes,
      OPERATING_END_MINUTES
    );
    for (let minutes = minEnd; minutes <= maxEnd; minutes += SLOT_INTERVAL_MINUTES) {
      endTimeOptions.push({ value: toTimeValue(minutes), label: toTimeLabel(minutes) });
    }
  }

  const isThirtyMinuteSlot = (timeValue) => {
    if (!timeValue || !timeValue.includes(':')) {
      return false;
    }
    const [hours, minutes] = timeValue.split(':').map(Number);
    return Number.isInteger(hours) && Number.isInteger(minutes) && (minutes === 0 || minutes === 30);
  };

  const getTimeValidationError = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return '';
    }

    if (!isThirtyMinuteSlot(startTime) || !isThirtyMinuteSlot(endTime)) {
      return 'Start and end times must use 30-minute intervals';
    }

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return 'Start time must be earlier than end time';
    }

    if (startMinutes < availabilityWindow.startMinutes || endMinutes > availabilityWindow.endMinutes) {
      return `Booking must be within the resource availability window (${resource?.availability || 'default hours'})`;
    }

    if ((endMinutes - startMinutes) > MAX_BOOKING_DURATION_MINUTES) {
      return 'Booking duration cannot exceed 3 hours';
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

  // Re-fetch whenever the user returns to this tab so status stays current
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchResource();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [id]);

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
      const message = 'Expected attendees must be at least 1';
      setAttendeesError(message);
      toast.error(message);
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
                    overlayClassName="bg-black/60 backdrop-blur-sm z-[50]"
                    className="sm:max-w-md bg-[#0f1629]/80 backdrop-blur-xl border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)] text-white z-[50]"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-white font-bold text-xl drop-shadow-md">Book {resource.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div>
                        <Label htmlFor="date" className="text-slate-200">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          min={minDate}
                          max={maxDate}
                          value={bookingData.date}
                          onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                          className="bg-[#1a1a2e]/60 border-orange-500/30 text-white placeholder:text-slate-400 focus-visible:ring-orange-500/50 backdrop-blur-md"
                          required
                          data-testid="booking-date-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start_time" className="text-slate-200">Start Time *</Label>
                          <Select
                            value={bookingData.start_time}
                            onValueChange={(value) => {
                              setBookingData((prev) => {
                                const startMinutes = toMinutes(value);
                                const endMinutes = toMinutes(prev.end_time);
                                const maxEndMinutes = Math.min(startMinutes + MAX_BOOKING_DURATION_MINUTES, OPERATING_END_MINUTES);
                                const endInvalid = !Number.isFinite(endMinutes)
                                  || endMinutes <= startMinutes
                                  || endMinutes > maxEndMinutes;

                                return {
                                  ...prev,
                                  start_time: value,
                                  end_time: endInvalid ? '' : prev.end_time,
                                };
                              });
                            }}
                          >
                            <SelectTrigger
                              id="start_time"
                              className="bg-[#1a1a2e]/60 border-orange-500/30 text-white focus-visible:ring-orange-500/50 backdrop-blur-md"
                              data-testid="booking-start-time-input"
                            >
                              <SelectValue placeholder="Select start" />
                            </SelectTrigger>
                            <SelectContent className="border-orange-500/30 bg-[#0f1629]/95 text-white shadow-xl backdrop-blur-xl z-[99999]">
                              {startTimeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="focus:bg-orange-500/20 focus:text-white data-[state=checked]:bg-orange-500/20 data-[state=checked]:text-white cursor-pointer transition-colors"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="end_time" className="text-slate-200">End Time *</Label>
                          <Select
                            value={bookingData.end_time}
                            onValueChange={(value) => setBookingData((prev) => ({ ...prev, end_time: value }))}
                            disabled={!bookingData.start_time}
                          >
                            <SelectTrigger
                              id="end_time"
                              className="bg-[#1a1a2e]/60 border-orange-500/30 text-white focus-visible:ring-orange-500/50 backdrop-blur-md"
                              data-testid="booking-end-time-input"
                            >
                              <SelectValue placeholder={bookingData.start_time ? 'Select end' : 'Select start first'} />
                            </SelectTrigger>
                            <SelectContent className="border-orange-500/30 bg-[#0f1629]/95 text-white shadow-xl backdrop-blur-xl z-[99999]">
                              {endTimeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="focus:bg-orange-500/20 focus:text-white data-[state=checked]:bg-orange-500/20 data-[state=checked]:text-white cursor-pointer transition-colors"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {timeError && <p className="text-xs text-red-600 -mt-2">{timeError}</p>}
                      <p className="text-xs text-slate-500 -mt-2">
                        Available in 30-minute slots within {resource?.availability || 'the resource availability window'}. Maximum booking duration is 3 hours.
                      </p>
                      <div>
                        <Label htmlFor="attendees" className="text-slate-200">Expected Attendees *</Label>
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
                            } else if (!Number.isNaN(count) && count < 1) {
                              setAttendeesError('Expected attendees must be at least 1');
                            } else if (!Number.isNaN(count) && count > resource.capacity) {
                              setAttendeesError(`Expected attendees cannot exceed capacity (${resource.capacity})`);
                            } else {
                              setAttendeesError('');
                            }
                          }}
                          className="bg-[#1a1a2e]/60 border-orange-500/30 text-white placeholder:text-slate-500 focus-visible:ring-orange-500/50 backdrop-blur-md"
                          required
                          data-testid="booking-attendees-input"
                        />
                        {attendeesError && <p className="text-xs text-red-400 mt-1">{attendeesError}</p>}
                      </div>
                      <div>
                        <Label htmlFor="purpose" className="text-slate-200">Purpose *</Label>
                        <Textarea
                          id="purpose"
                          rows={3}
                          value={bookingData.purpose}
                          onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                          className="bg-[#1a1a2e]/60 border-orange-500/30 text-white placeholder:text-slate-500 focus-visible:ring-orange-500/50 backdrop-blur-md resize-none"
                          required
                          placeholder="Briefly describe the purpose of this booking"
                          data-testid="booking-purpose-input"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setBookingOpen(false)} className="flex-1 border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 transition-colors bg-transparent">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting || !!timeError || !!attendeesError} className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all border-none" data-testid="submit-booking-btn">
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