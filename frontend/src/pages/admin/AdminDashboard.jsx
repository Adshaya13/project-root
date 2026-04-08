import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { resourceService } from '@/services/resourceService';
import { bookingService } from '@/services/bookingService';
import { ticketService } from '@/services/ticketService';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Ticket, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatusPill } from '@/components/common/StatusPill';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/Spinner';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResources: 0,
    pendingBookings: 0,
    openTickets: 0,
    totalUsers: 0,
    todayBookings: 0,
    unresolvedTickets: 0,
  });
  const [pendingBookings, setPendingBookings] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resources, allBookings, allTickets, users] = await Promise.all([
        resourceService.getAll(),
        bookingService.getAll(),
        ticketService.getAll(),
        adminService.getUsers(),
      ]);

      const pending = allBookings.filter((b) => b.status === 'PENDING');
      const open = allTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = allBookings.filter((b) => b.date === today && b.status === 'APPROVED').length;

      setStats({
        totalResources: resources.length,
        pendingBookings: pending.length,
        openTickets: open.filter((t) => t.status === 'OPEN').length,
        totalUsers: users.length,
        todayBookings,
        unresolvedTickets: open.length,
      });

      setPendingBookings(pending.slice(0, 5));
      setOpenTickets(open.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await bookingService.approve(bookingId);
      toast.success('Booking approved');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await bookingService.reject(bookingId, reason);
      toast.success('Booking rejected');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Admin Dashboard">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Admin Dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Admin Dashboard
          </h1>
          <p className="text-slate-600">Manage your campus operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200" onClick={() => navigate('/admin/resources')} style={{ cursor: 'pointer' }}>
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
            onClick={() => navigate('/admin/bookings')}
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

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200" onClick={() => navigate('/admin/tickets')} style={{ cursor: 'pointer' }}>
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

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Today's Bookings</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.todayBookings}</p>
                </div>
                <div className="p-3 bg-cyan-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Unresolved Tickets</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.unresolvedTickets}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bookings */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Booking Requests</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/bookings')}>
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
                      <Button size="sm" onClick={() => handleApproveBooking(booking.booking_id)} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectBooking(booking.booking_id)} className="text-red-600 border-red-200 hover:bg-red-50">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Open Tickets</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/tickets')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {openTickets.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No open tickets</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openTickets.map((ticket) => (
                      <tr key={ticket.ticket_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-900">{ticket.user_name}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{ticket.category}</td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusPill status={ticket.status} />
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};