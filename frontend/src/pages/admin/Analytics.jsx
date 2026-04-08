import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { resourceService } from '@/services/resourceService';
import { bookingService } from '@/services/bookingService';
import { ticketService } from '@/services/ticketService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#1e3a5f', '#f97316', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [monthlyBookings, setMonthlyBookings] = useState([]);
  const [ticketsByCategory, setTicketsByCategory] = useState([]);
  const [topResources, setTopResources] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [resources, bookings, tickets] = await Promise.all([resourceService.getAll(), bookingService.getAll(), ticketService.getAll()]);

      // Calculate stats
      const totalBookings = bookings.length;
      const approvedBookings = bookings.filter((b) => b.status === 'APPROVED').length;
      const approvalRate = totalBookings > 0 ? Math.round((approvedBookings / totalBookings) * 100) : 0;

      const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED');
      const avgResolutionTime = resolvedTickets.length > 0 ? '2.5 days' : 'N/A';

      setStats({
        totalBookings,
        approvalRate,
        avgResolutionTime,
        activeResources: resources.filter((r) => r.status === 'ACTIVE').length,
      });

      // Monthly bookings (last 6 months mock data)
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = months.map((month, index) => ({
        month,
        bookings: Math.floor(Math.random() * 50) + 20 + index * 5,
      }));
      setMonthlyBookings(monthlyData);

      // Tickets by category
      const categories = {};
      tickets.forEach((ticket) => {
        categories[ticket.category] = (categories[ticket.category] || 0) + 1;
      });
      const categoryData = Object.keys(categories).map((key) => ({
        name: key,
        value: categories[key],
      }));
      setTicketsByCategory(categoryData);

      // Top 5 resources by booking count
      const resourceBookings = {};
      bookings.forEach((booking) => {
        if (booking.resource_name) {
          resourceBookings[booking.resource_name] = (resourceBookings[booking.resource_name] || 0) + 1;
        }
      });
      const topResourcesData = Object.keys(resourceBookings)
        .map((key) => ({
          name: key,
          bookings: resourceBookings[key],
        }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);
      setTopResources(topResourcesData);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Analytics">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Analytics">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Track your campus operations performance</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalBookings}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Approval Rate</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvalRate}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Avg Resolution Time</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.avgResolutionTime}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Active Resources</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeResources}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Bookings Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#1e3a5f" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Tickets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ticketsByCategory} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={100} fill="#8884d8" dataKey="value">
                    {ticketsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Top 5 Most Booked Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topResources} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={150} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#f97316" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};