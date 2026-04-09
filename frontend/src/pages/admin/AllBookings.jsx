import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { bookingService } from '@/services/bookingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusPill } from '@/components/common/StatusPill';
import { LoadingSpinner } from '@/components/common/Spinner';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

export const AllBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchBookings();

    const intervalId = setInterval(() => {
      fetchBookings();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (booking) => {
    try {
      await bookingService.approve(booking.booking_id);
      toast.success('Booking approved. User notified.');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to approve booking');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await bookingService.reject(selectedBooking.booking_id, rejectionReason);
      toast.success('Booking rejected. User notified.');
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  const filteredBookings = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <Layout pageTitle="All Bookings">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="All Bookings">
      <div className="space-y-6">
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="ALL">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="PENDING">Pending ({bookings.filter((b) => b.status === 'PENDING').length})</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved ({bookings.filter((b) => b.status === 'APPROVED').length})</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected ({bookings.filter((b) => b.status === 'REJECTED').length})</TabsTrigger>
            <TabsTrigger value="CANCELLED">Cancelled ({bookings.filter((b) => b.status === 'CANCELLED').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>{filteredBookings.length} Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Resource</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Purpose</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Attendees</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => (
                        <tr key={booking.booking_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-900">{booking.user_name}</td>
                          <td className="py-3 px-4 text-sm">
                            <Badge
                              className={
                                booking.user_role === 'STAFF'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }
                            >
                              {booking.user_role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-900">{booking.resource_name}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{formatDate(booking.date)}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {booking.start_time}-{booking.end_time}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate" title={booking.purpose}>
                            {booking.purpose}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{booking.attendees}</td>
                          <td className="py-3 px-4">
                            <StatusPill status={booking.status} />
                            {booking.rejection_reason && <p className="text-xs text-red-600 mt-1">Reason: {booking.rejection_reason}</p>}
                          </td>
                          <td className="py-3 px-4">
                            {booking.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleApprove(booking)} className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setRejectDialogOpen(true);
                                  }}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent
            overlayClassName="bg-black/85 backdrop-blur-[2px]"
            className="border border-white/35 bg-white/85 backdrop-blur-md shadow-2xl"
          >
            <DialogHeader>
              <DialogTitle className="text-slate-900">Reject Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason" className="text-slate-700">Rejection Reason *</Label>
                <Textarea
                  id="reason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  className="bg-white/75 border-slate-300/80 placeholder:text-slate-400"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectDialogOpen(false);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-700">
                  Reject Booking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};