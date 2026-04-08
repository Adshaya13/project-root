import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ticketService } from '@/services/ticketService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusPill } from '@/components/common/StatusPill';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/Spinner';
import { AlertTriangle } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

export const TicketOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async (ticketId) => {
    try {
      await ticketService.escalate(ticketId);
      toast.success('Ticket escalated to CRITICAL priority');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to escalate ticket');
    }
  };

  const canEscalate = (ticket) => {
    if (ticket.status !== 'OPEN') return false;
    const createdDate = new Date(ticket.created_at);
    const now = new Date();
    const hoursDiff = (now - createdDate) / (1000 * 60 * 60);
    return hoursDiff > 48;
  };

  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);

  if (loading) {
    return (
      <Layout pageTitle="Ticket Overview">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Ticket Overview">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ticket Overview</h2>
          <p className="text-sm text-slate-600 mt-1">Read-only view of all maintenance tickets</p>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="OPEN">Open</TabsTrigger>
            <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
            <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
            <TabsTrigger value="CLOSED">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>{filteredTickets.length} Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Location</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Priority</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Assigned</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Created</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.ticket_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-900">{ticket.user_name}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{ticket.location}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{ticket.category}</td>
                          <td className="py-3 px-4">
                            <PriorityBadge priority={ticket.priority} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusPill status={ticket.status} />
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{ticket.assigned_to_name || 'Unassigned'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{formatDate(ticket.created_at)}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}>
                                View
                              </Button>
                              {canEscalate(ticket) && (
                                <Button size="sm" variant="outline" onClick={() => handleEscalate(ticket.ticket_id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Escalate
                                </Button>
                              )}
                            </div>
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
      </div>
    </Layout>
  );
};