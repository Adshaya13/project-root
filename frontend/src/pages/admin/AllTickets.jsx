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
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

export const AllTickets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let ticketsData = [];
    try {
      ticketsData = await ticketService.getAll();
      setTickets(ticketsData);
    } catch (error) {
      toast.error('Failed to load tickets');
      setTickets([]);
    }

    try {
      const techData = await adminService.getUsers({ role: 'TECHNICIAN' });
      setTechnicians(Array.isArray(techData) ? techData : []);
    } catch (error) {
      setTechnicians([]);
      if (ticketsData.length > 0) {
        const serverMessage = error?.response?.data?.message || error?.message;
        toast.error(serverMessage
          ? `Technician list unavailable (${serverMessage}). Assignment is temporarily disabled.`
          : 'Technician list unavailable. Assignment is temporarily disabled.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!pendingAssignment) {
      return;
    }

    setAssigning(true);
    try {
      await ticketService.assign(pendingAssignment.ticketId, pendingAssignment.technicianId);
      toast.success('Ticket assigned successfully');
      setPendingAssignment(null);
      await fetchData();
    } catch (error) {
      toast.error('Failed to assign ticket');
    } finally {
      setAssigning(false);
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
            <TabsTrigger value="ASSIGNED">Assigned</TabsTrigger>
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
                          <td className="py-3 px-4 text-sm text-slate-900">{ticket.requester_name || ticket.user_name || 'Unknown'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{ticket.location}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{ticket.category}</td>
                          <td className="py-3 px-4">
                            <PriorityBadge priority={ticket.priority} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusPill status={ticket.status} />
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {ticket.assigned_to_name ? (
                              <span>{ticket.assigned_to_name}</span>
                            ) : (
                              technicians.length > 0 ? (
                              <Select
                                onValueChange={(value) => {
                                  const technician = technicians.find((tech) => tech.user_id === value || tech.id === value);
                                  setPendingAssignment({
                                    ticketId: ticket.ticket_id,
                                    technicianId: value,
                                    technicianName: technician?.name || 'selected technician',
                                  });
                                }}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {technicians.map((tech) => (
                                    <SelectItem key={tech.user_id || tech.id} value={tech.user_id || tech.id}>
                                      {tech.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              ) : (
                                <span className="text-xs text-slate-500">Not Assigned</span>
                              )
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

      <ConfirmDialog
        open={Boolean(pendingAssignment)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAssignment(null);
          }
        }}
        title="Confirm Technician Assignment"
        description={
          pendingAssignment
            ? `Assign this ticket to ${pendingAssignment.technicianName}? This will set the status to ASSIGNED.`
            : 'Confirm assignment'
        }
        onConfirm={handleAssign}
        confirmText={assigning ? 'Assigning...' : 'Confirm Assignment'}
      />
    </Layout>
  );
};