import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthContext } from '@/context/AuthContext';
import { ticketService } from '@/services/ticketService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/common/StatusPill';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/Spinner';
import { Ticket, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

export const TechnicianDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolvedThisWeek: 0,
    unread: 0,
  });
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await ticketService.getAll();
      const assigned = data.filter((t) => t.status === 'ASSIGNED' || t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
      const inProgress = data.filter((t) => t.status === 'IN_PROGRESS').length;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const resolvedThisWeek = data.filter((t) => {
        if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
          const createdDate = new Date(t.created_at);
          return createdDate >= oneWeekAgo;
        }
        return false;
      }).length;

      setStats({ assigned, inProgress, resolvedThisWeek, unread: 0 });
      setTickets(data.sort((a, b) => {
        const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Technician Dashboard">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Technician Dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-slate-600">Here are your assigned tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Assigned to Me</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.assigned}</p>
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
                  <p className="text-sm text-slate-600 font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Resolved This Week</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolvedThisWeek}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Unread Notifications</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.unread}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Tickets */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Assigned Tickets (Sorted by Priority)</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/technician/tickets')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No tickets assigned yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Reported By</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.slice(0, 10).map((ticket) => (
                      <tr key={ticket.ticket_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-600">{ticket.ticket_id.slice(-8)}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{ticket.location}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{ticket.category}</td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusPill status={ticket.status} />
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{ticket.requester_name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{formatDate(ticket.created_at)}</td>
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