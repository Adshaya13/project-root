import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ticketService } from '@/services/ticketService';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusPill } from '@/components/common/StatusPill';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/Spinner';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

export const AllTickets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsData, techData] = await Promise.all([ticketService.getAll(), adminService.getUsers({ role: 'TECHNICIAN' })]);
      setTickets(ticketsData);
      setTechnicians(techData);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (ticketId, technicianId) => {
    try {
      await ticketService.assign(ticketId, technicianId);
      toast.success('Ticket assigned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);

  if (loading) {
    return (
      <Layout pageTitle="All Tickets">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="All Tickets">
      <div className="space-y-6">
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Assigned To</th>
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
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {ticket.assigned_to ? (
                              <span>{ticket.assigned_to_name}</span>
                            ) : (
                              <Select onValueChange={(value) => handleAssign(ticket.ticket_id, value)}>
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {technicians.map((tech) => (
                                    <SelectItem key={tech.user_id} value={tech.user_id}>
                                      {tech.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};