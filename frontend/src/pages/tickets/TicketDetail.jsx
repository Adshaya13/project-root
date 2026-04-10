import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthContext } from '@/context/AuthContext';
import { ticketService } from '@/services/ticketService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusPill } from '@/components/common/StatusPill';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/Spinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ArrowLeft, Send, Trash2, User, MapPin, Phone } from 'lucide-react';
import { formatDate, formatTimeAgo } from '@/utils/formatDate';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const data = await ticketService.getById(id);
      setTicket(data);
    } catch (error) {
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await ticketService.addComment(id, commentText);
      setCommentText('');
      fetchTicket();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await ticketService.deleteComment(id, selectedComment.comment_id);
      setDeleteDialogOpen(false);
      setSelectedComment(null);
      fetchTicket();
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleStartEditComment = (comment) => {
    setEditModeCommentId(comment.comment_id);
    setEditCommentText(comment.text || '');
  };

  const handleCancelEditComment = () => {
    setEditModeCommentId(null);
    setEditCommentText('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    setSubmittingEdit(true);
    try {
      await ticketService.updateComment(id, commentId, editCommentText);
      handleCancelEditComment();
      fetchTicket();
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const getNextStatus = (status) => {
    const transitions = {
      OPEN: 'IN_PROGRESS',
      ASSIGNED: 'IN_PROGRESS',
      IN_PROGRESS: 'RESOLVED',
      RESOLVED: 'CLOSED',
    };
    return transitions[status] || null;
  };

  const formatStatusLabel = (status) => status?.replace('_', ' ');

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus(ticket?.status);
    if (!nextStatus) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const updated = await ticketService.updateStatus(id, nextStatus);
      setTicket(updated);
      toast.success(`Ticket moved to ${formatStatusLabel(nextStatus)}`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Failed to update ticket status';
      toast.error(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCloseTicket = async () => {
    setClosingTicket(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'}/api/tickets/${id}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result?.message || 'Failed to close ticket');
      }
      
      setTicket(result?.data || result);
      setCloseDialogOpen(false);
      toast.success('Ticket closed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to close ticket');
    } finally {
      setClosingTicket(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const currentUserId = user?.user_id || user?.id;
  const currentUserEmail = user?.email || user?.user_email || '';
  const normalizedRole = String(user?.role || '').toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN';
  const isTechnician = normalizedRole === 'TECHNICIAN';
  
  const statusTimeline = isTechnician ? ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] : ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const currentIndex = statusTimeline.indexOf(ticket?.status);
  const canTechnicianUpdate = isTechnician
    && (ticket?.assigned_to === currentUserId
      || String(ticket?.requester_email || '').toLowerCase() === String(currentUserEmail).toLowerCase());
  const canTransitionStatus = isTechnician && canTechnicianUpdate;
  const computedNextStatus = getNextStatus(ticket?.status);
  const nextStatus = isTechnician && computedNextStatus === 'CLOSED' ? null : computedNextStatus;

  const getCommentOwnerId = (comment) => comment.created_by || comment.createdBy || comment.user_id || comment.userId;
  const canEditComment = (comment) => getCommentOwnerId(comment) && getCommentOwnerId(comment) === currentUserId;
  const canDeleteComment = (comment) => canEditComment(comment) || isAdmin;

  if (loading) {
    return (
      <Layout pageTitle="Ticket Details">
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout pageTitle="Ticket Details">
        <div className="text-center py-12">
          <p className="text-slate-600">Ticket not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Ticket Details">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} data-testid="back-btn">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Ticket #{ticket.ticket_id}</p>
                    <CardTitle className="text-2xl mt-1">{ticket.category}</CardTitle>
                    <p className="text-sm text-slate-600 mt-2">Created {formatDate(ticket.created_at)}</p>
                  </div>
                  <StatusPill status={ticket.status} />
                </div>
              </CardHeader>
            </Card>

            {/* Status Timeline */}
            {!['REJECTED', 'CANCELLED'].includes(ticket.status) && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {statusTimeline.map((status, index) => (
                      <div key={status} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index <= currentIndex ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            {index < currentIndex ? '✓' : index + 1}
                          </div>
                          <p className={`text-xs mt-2 ${index <= currentIndex ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>{status.replace('_', ' ')}</p>
                        </div>
                        {index < statusTimeline.length - 1 && <div className={`flex-1 h-1 ${index < currentIndex ? 'bg-blue-500' : 'bg-slate-200'}`} />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>

            {/* Images */}
            {ticket.images && ticket.images.length > 0 && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ticket.images.map((imagePath, index) => (
                      <a key={index} href={`${BACKEND_URL}/api/files/${imagePath}`} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={`${BACKEND_URL}/api/files/${imagePath}`}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resolution Notes */}
            {ticket.resolution_notes && (
              <Card className="bg-green-50 border-green-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-green-900">Resolution Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-800">{ticket.resolution_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Comments ({ticket.comments?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div className="space-y-4">
                    {ticket.comments.map((comment) => (
                      <div key={comment.comment_id} className="flex gap-3 p-4 bg-slate-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#1e3a5f] text-white text-sm">{getInitials(comment.user_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{comment.user_name}</span>
                              {comment.user_id === user?.user_id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">{formatTimeAgo(comment.created_at)}</span>
                              {(comment.user_id === user?.user_id || user?.role === 'ADMIN') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedComment(comment);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No comments yet</p>
                )}

                {/* Add comment form */}
                <form onSubmit={handleAddComment} className="mt-4">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="mb-2"
                    data-testid="comment-input"
                  />
                  <Button type="submit" disabled={submittingComment || !commentText.trim()} className="bg-[#1e3a5f] hover:bg-slate-800" data-testid="post-comment-btn">
                    <Send className="h-4 w-4 mr-2" />
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isTechnician && canTransitionStatus && nextStatus && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Status Action</p>
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={updatingStatus}
                      className="w-full bg-[#f97316] hover:bg-orange-600"
                    >
                      {updatingStatus ? 'Updating...' : `Move to ${formatStatusLabel(nextStatus)}`}
                    </Button>
                  </div>
                )}
                {isAdmin && ticket?.status === 'RESOLVED' && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Admin Action</p>
                    <Button
                      onClick={() => setCloseDialogOpen(true)}
                      disabled={closingTicket}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {closingTicket ? 'Closing...' : 'Confirm & Close Ticket'}
                    </Button>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-500 mb-1">Priority</p>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Category</p>
                  <p className="text-sm font-medium text-slate-900">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-900">{ticket.location}</p>
                  </div>
                </div>
                {ticket.resource_name && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Resource</p>
                    <p className="text-sm font-medium text-slate-900">{ticket.resource_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-500 mb-1">Reported By</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-900">{ticket.requester_name || 'Unknown'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Contact</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-900">{ticket.contact_details}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Assigned To</p>
                  <p className="text-sm font-medium text-slate-900">{ticket.assigned_to_name || 'Not Assigned'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ConfirmDialog
          open={closeDialogOpen}
          onOpenChange={setCloseDialogOpen}
          title="Close Ticket"
          description="Are you sure you want to close this ticket? This action cannot be undone."
          onConfirm={handleCloseTicket}
          confirmText="Close Ticket"
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Comment"
          description="Are you sure you want to delete this comment? This action cannot be undone."
          onConfirm={handleDeleteComment}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </Layout>
  );
};