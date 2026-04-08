import React, { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { NotificationContext } from '@/context/NotificationContext';
import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatTimeAgo } from '@/utils/formatDate';
import { useNavigate } from 'react-router-dom';

const ROLE_COLORS = {
  USER: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-purple-100 text-purple-800',
  TECHNICIAN: 'bg-green-100 text-green-800',
  MANAGER: 'bg-orange-100 text-orange-800',
};

export const Navbar = ({ onMenuClick, pageTitle }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    markAsRead(notification.notification_id);
    if (notification.related_id) {
      if (notification.type.includes('booking')) {
        navigate(user.role === 'USER' ? '/bookings/my' : '/admin/bookings');
      } else if (notification.type.includes('ticket')) {
        navigate(`/tickets/${notification.related_id}`);
      }
    }
    setNotifOpen(false);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200" data-testid="navbar">
      <div className="px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-200 transition-colors"
              data-testid="menu-button"
            >
              <Menu className="h-6 w-6 text-slate-700" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              {pageTitle}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-slate-200 transition-colors" data-testid="notifications-bell">
                  <Bell className="h-5 w-5 text-slate-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" data-testid="unread-count-badge">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#f97316] hover:underline"
                      data-testid="mark-all-read-btn"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 5).length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500" data-testid="no-notifications">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.notification_id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.is_read ? 'bg-blue-50' : ''
                        }`}
                        data-testid={`notification-item-${notif.notification_id}`}
                      >
                        <div className="flex items-start gap-2">
                          {!notif.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">{notif.message}</p>
                            <p className="text-xs text-slate-500 mt-1">{formatTimeAgo(notif.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      navigate('/notifications');
                      setNotifOpen(false);
                    }}
                    className="w-full text-center text-sm text-[#f97316] hover:underline py-2"
                    data-testid="view-all-notifications-btn"
                  >
                    View all
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-200 transition-all duration-200" data-testid="user-menu-trigger">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-[#1e3a5f] text-white text-xs">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user?.role]}`}>
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-slate-500 font-normal">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="profile-menu-item">
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/role-selection')} data-testid="switch-role-menu-item" className="text-[#f97316]">
                  Switch Role (Demo)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600" data-testid="logout-menu-item">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
