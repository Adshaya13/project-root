import React, { useContext } from 'react';
import { Layout } from '@/components/layout/Layout';
import { NotificationContext } from '@/context/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/Spinner';
import { Bell, CheckCheck } from 'lucide-react';
import { formatTimeAgo } from '@/utils/formatDate';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState('ALL');

  const handleNotificationClick = (notification) => {
    markAsRead(notification.notification_id);
    if (notification.related_id) {
      if (notification.type.includes('booking')) {
        navigate('/bookings/my');
      } else if (notification.type.includes('ticket')) {
        navigate(`/tickets/${notification.related_id}`);
      }
    }
  };

  const filteredNotifications = filter === 'ALL' ? notifications : filter === 'UNREAD' ? notifications.filter((n) => !n.is_read) : notifications.filter((n) => n.is_read);

  const getNotificationIcon = (type) => {
    if (type.includes('booking')) return '📅';
    if (type.includes('ticket')) return '🎫';
    if (type.includes('comment')) return '💬';
    return '🔔';
  };

  const getNotificationColor = (type) => {
    if (type.includes('approved')) return 'text-green-600';
    if (type.includes('rejected')) return 'text-red-600';
    if (type.includes('assigned')) return 'text-blue-600';
    return 'text-slate-600';
  };

  if (loading) {
    return (
      <Layout pageTitle="Notifications">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Notifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
          {notifications.filter((n) => !n.is_read).length > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm" data-testid="mark-all-read-btn">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="ALL">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="UNREAD">Unread ({notifications.filter((n) => !n.is_read).length})</TabsTrigger>
            <TabsTrigger value="READ">Read ({notifications.filter((n) => n.is_read).length})</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {filteredNotifications.length === 0 ? (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-12">
                  <div className="text-center">
                    <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No notifications</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.notification_id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                              <p className={`font-medium ${getNotificationColor(notification.type)}`}>{notification.message}</p>
                            </div>
                            <span className="text-xs text-slate-500">{formatTimeAgo(notification.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};