import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthContext } from '@/context/AuthContext';
import { resourceService } from '@/services/resourceService';
import { bookingService } from '@/services/bookingService';
import { ticketService } from '@/services/ticketService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Ticket, TrendingUp, AlertCircle } from 'lucide-react';
import { StatusPill } from '@/components/common/StatusPill';
import { LoadingSpinner } from '@/components/common/Spinner';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

export const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResources: 0,
    pendingBookings: 0,
    approvedToday: 0,
    openTickets: 0,
    utilizationRate: 0,
  });
  const [pendingBookings, setPendingBookings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resources, bookings, tickets] = await Promise.all([resourceService.getAll(), bookingService.getAll(), ticketService.getAll()]);

      const pending = bookings.filter((b) => b.status === 'PENDING');
      const today = new Date().toISOString().split('T')[0];
      const approvedToday = bookings.filter((b) => b.date === today && b.status === 'APPROVED').length;
      const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

      const utilizationRate = resources.length > 0 ? Math.round((approvedToday / resources.length) * 100) : 0;

      setStats({
        totalResources: resources.length,
        pendingBookings: pending.length,
        approvedToday,
        openTickets,
        utilizationRate,
      });

      setPendingBookings(pending.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await bookingService.approve(bookingId);
      toast.success('Booking approved');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve booking');
    }
  };

  const handleReject = async (bookingId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await bookingService.reject(bookingId, reason);
      toast.success('Booking rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Manager Dashboard">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Manager Dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manager Dashboard</h1>
          <p className="text-slate-600">Oversee campus resources and operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200" onClick={() => navigate('/manager/resources')} style={{ cursor: 'pointer' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Resources</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalResources}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-orange-200 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => navigate('/manager/bookings')}
            style={{ cursor: 'pointer' }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Pending Bookings</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingBookings}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Approved Today</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedToday}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200" onClick={() => navigate('/manager/tickets')} style={{ cursor: 'pointer' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Open Tickets</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.openTickets}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Ticket className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Utilization Rate</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.utilizationRate}%</p>
                </div>
                <div className="p-3 bg-cyan-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bookings */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Booking Approvals</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/manager/bookings')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No pending bookings</p>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div key={booking.booking_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{booking.resource_name}</p>
                      <p className="text-sm text-slate-600">
                        {booking.user_name} • {formatDate(booking.date)} • {booking.start_time}-{booking.end_time}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{booking.purpose}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(booking.booking_id)} className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(booking.booking_id)} className="text-red-600 border-red-200 hover:bg-red-50">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};