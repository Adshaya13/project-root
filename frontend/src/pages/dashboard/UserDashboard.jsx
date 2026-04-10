import React, { useEffect, useState, useContext } from 'react';
import { Layout } from '@/components/layout/Layout';
import { AuthContext } from '@/context/AuthContext';
import { resourceService } from '@/services/resourceService';
import { bookingService } from '@/services/bookingService';
import { ticketService } from '@/services/ticketService';
import { notificationService } from '@/services/notificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, Ticket, Bell, ArrowRight, Plus } from 'lucide-react';
import { StatusPill } from '@/components/common/StatusPill';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/Spinner';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/formatDate';

export const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeBookings: 0,
    openTickets: 0,
    unreadNotifications: 0,
    availableResources: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsResult, ticketsResult, notifResult, resourcesResult] = await Promise.allSettled([
        bookingService.getMyBookings(),
        ticketService.getMy(),
        notificationService.getUnreadCount(),
        resourceService.getAll({ status: 'ACTIVE' }),
      ]);

      const bookings = bookingsResult.status === 'fulfilled' && Array.isArray(bookingsResult.value)
        ? bookingsResult.value
        : [];
      const tickets = ticketsResult.status === 'fulfilled' && Array.isArray(ticketsResult.value)
        ? ticketsResult.value
        : [];
      const notifCount = notifResult.status === 'fulfilled'
        ? (notifResult.value?.count ?? notifResult.value?.data?.count ?? 0)
        : 0;
      const resources = resourcesResult.status === 'fulfilled' && Array.isArray(resourcesResult.value)
        ? resourcesResult.value
        : [];

      const activeBookings = bookings.filter((b) => b.status === 'APPROVED').length;
      const openTickets = tickets.filter((t) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(String(t.status || '').toUpperCase())).length;

      setStats({
        activeBookings,
        openTickets,
        unreadNotifications: notifCount,
        availableResources: resources.length,
      });

      setRecentBookings(bookings.slice(0, 5));
      setRecentTickets(tickets.slice(0, 5));

      if (notifResult.status === 'rejected') {
        console.warn('Unread notification count unavailable:', notifResult.reason);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Dashboard">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Dashboard">
      <div className="space-y-8">
        {/* Welcome section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-600" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Here's what's happening with your campus activities
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Active Bookings</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2" data-testid="active-bookings-count">{stats.activeBookings}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Open Tickets</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2" data-testid="open-tickets-count">{stats.openTickets}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Ticket className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Unread Notifications</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2" data-testid="unread-notifications-count">{stats.unreadNotifications}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Resources Available</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2" data-testid="available-resources-count">{stats.availableResources}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate('/resources')}
                className="h-auto py-4 bg-[#1e3a5f] hover:bg-slate-800 transition-all duration-200"
                data-testid="browse-resources-btn"
              >
                <Building2 className="h-5 w-5 mr-2" />
                Browse Resources
              </Button>
              <Button
                onClick={() => navigate('/tickets/new')}
                className="h-auto py-4 bg-[#f97316] hover:bg-orange-600 transition-all duration-200"
                data-testid="create-ticket-btn"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Ticket
              </Button>
              <Button
                onClick={() => navigate('/bookings/my')}
                variant="outline"
                className="h-auto py-4 border-slate-300 hover:bg-slate-50 transition-all duration-200"
                data-testid="view-bookings-btn"
              >
                <Calendar className="h-5 w-5 mr-2" />
                View My Bookings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/bookings/my')} data-testid="view-all-bookings-btn">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No bookings yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Resource</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.booking_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-900">{booking.resource_name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{formatDate(booking.date)}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {booking.start_time} - {booking.end_time}
                        </td>
                        <td className="py-3 px-4">
                          <StatusPill status={booking.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent tickets */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Tickets</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tickets/my')} data-testid="view-all-tickets-btn">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No tickets yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((ticket) => (
                      <tr
                        key={ticket.ticket_id}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                      >
                        <td className="py-3 px-4 text-sm text-slate-900">{ticket.category}</td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusPill status={ticket.status} />
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{formatDate(ticket.created_at)}</td>
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
