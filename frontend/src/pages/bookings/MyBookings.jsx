import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { bookingService } from '@/services/bookingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusPill } from '@/components/common/StatusPill';
import { LoadingSpinner } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Calendar, XCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

export const MyBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await bookingService.cancel(selectedBooking.booking_id);
      toast.success('Booking cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const filteredBookings = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Confirmed';
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Rejected';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="My Bookings">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="My Bookings">
      <div className="space-y-6">
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="ALL" className="text-slate-600 data-[state=active]:text-slate-900" data-testid="filter-all">All</TabsTrigger>
            <TabsTrigger value="PENDING" className="text-slate-600 data-[state=active]:text-slate-900" data-testid="filter-pending">Pending</TabsTrigger>
            <TabsTrigger value="APPROVED" className="text-slate-600 data-[state=active]:text-slate-900" data-testid="filter-approved">Confirmed</TabsTrigger>
            <TabsTrigger value="REJECTED" className="text-slate-600 data-[state=active]:text-slate-900" data-testid="filter-rejected">Rejected</TabsTrigger>
            <TabsTrigger value="CANCELLED" className="text-slate-600 data-[state=active]:text-slate-900" data-testid="filter-cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {filteredBookings.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No bookings found"
                description={filter === 'ALL' ? 'You have no bookings yet. Browse resources to make your first booking.' : `No ${filter.toLowerCase()} bookings found.`}
                action="Browse Resources"
                onAction={() => (window.location.href = '/resources')}
              />
            ) : (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>{filteredBookings.length} Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
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
                            <td className="py-3 px-4 text-sm text-slate-900">{booking.resource_name || 'Unknown'}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">{formatDate(booking.date)}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {booking.start_time} - {booking.end_time}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate" title={booking.purpose}>
                              {booking.purpose}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">{booking.attendees}</td>
                            <td className="py-3 px-4">
                              <StatusPill status={booking.status} />
                              <p className="text-xs text-slate-500 mt-1">{getStatusLabel(booking.status)}</p>
                              {booking.status === 'REJECTED' && booking.rejection_reason && (
                                <p className="text-xs text-red-600 mt-1" title={booking.rejection_reason}>
                                  Reason: {booking.rejection_reason}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setCancelDialogOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                  data-testid={`cancel-btn-${booking.booking_id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <ConfirmDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          title="Cancel Booking"
          description={`Are you sure you want to cancel this booking for ${selectedBooking?.resource_name}?`}
          onConfirm={handleCancelBooking}
          confirmText="Yes, Cancel"
          variant="destructive"
        />
      </div>
    </Layout>
  );
};