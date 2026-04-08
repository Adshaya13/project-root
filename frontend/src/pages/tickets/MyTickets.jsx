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
import { EmptyState } from '@/components/common/EmptyState';
import { Ticket, Plus } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

export const MyTickets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getMy();
      setTickets(data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);

  if (loading) {
    return (
      <Layout pageTitle="My Tickets">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="My Tickets">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">My Tickets</h2>
          <Button onClick={() => navigate('/tickets/new')} className="bg-[#f97316] hover:bg-orange-600" data-testid="create-ticket-btn">
            <Plus className="h-4 w-4 mr-2" />
            Create New Ticket
          </Button>
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
            {filteredTickets.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="No tickets found"
                description={filter === 'ALL' ? 'You have no tickets yet. Create a ticket to report an issue.' : `No ${filter.toLowerCase()} tickets found.`}
                action="Create Ticket"
                onAction={() => navigate('/tickets/new')}
              />
            ) : (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>{filteredTickets.length} Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Resource</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Category</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Priority</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Created</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket) => (
                          <tr
                            key={ticket.ticket_id}
                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                            onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                          >
                            <td className="py-3 px-4 text-sm text-slate-900">{ticket.resource_name || ticket.location}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">{ticket.category}</td>
                            <td className="py-3 px-4">
                              <PriorityBadge priority={ticket.priority} />
                            </td>
                            <td className="py-3 px-4">
                              <StatusPill status={ticket.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">{formatDate(ticket.created_at)}</td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tickets/${ticket.ticket_id}`);
                                }}
                                data-testid={`view-ticket-btn-${ticket.ticket_id}`}
                              >
                                View
                              </Button>
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
      </div>
    </Layout>
  );
};