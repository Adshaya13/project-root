import React, { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { NotificationContext } from '@/context/NotificationContext';
import { useTheme } from '@/context/ThemeContext';
import { Menu, Bell, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
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
  USER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  TECHNICIAN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MANAGER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

/* ── Animated Glowing Search Bar (inline, sized for navbar) ── */
const NavSearchBar = () => (
  <div className="relative flex items-center justify-center">
    <div id="poda-nav" className="relative flex items-center justify-center group">
      {/* Glow layers */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute z-[-1] overflow-hidden h-full w-full max-h-[44px] max-w-[220px] rounded-xl blur-[3px]
                     before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px]
                     before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                     before:rotate-[82deg]
                     before:bg-[conic-gradient(rgba(0,0,0,0),#18116a,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#6e1b60,rgba(0,0,0,0)_60%)]
                     before:transition-all before:duration-[2000ms]
                     group-hover:before:rotate-[-98deg]
                     group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms]"
        />
      ))}
      <div
        className="absolute z-[-1] overflow-hidden h-full w-full max-h-[42px] max-w-[218px] rounded-xl blur-[2px]
                   before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px]
                   before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                   before:rotate-[83deg]
                   before:bg-[conic-gradient(rgba(0,0,0,0)_0%,#a099d8,rgba(0,0,0,0)_8%,rgba(0,0,0,0)_50%,#dfa2da,rgba(0,0,0,0)_58%)]
                   before:brightness-[1.4] before:transition-all before:duration-[2000ms]
                   group-hover:before:rotate-[-97deg]
                   group-focus-within:before:rotate-[443deg] group-focus-within:before:duration-[4000ms]"
      />
      <div
        className="absolute z-[-1] overflow-hidden h-full w-full max-h-[40px] max-w-[215px] rounded-xl blur-[0.5px]
                   before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px]
                   before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                   before:rotate-[70deg]
                   before:bg-[conic-gradient(#1c191c,#402fb5_5%,#1c191c_14%,#1c191c_50%,#cf30aa_60%,#1c191c_64%)]
                   before:brightness-[1.3] before:transition-all before:duration-[2000ms]
                   group-hover:before:rotate-[-110deg]
                   group-focus-within:before:rotate-[430deg] group-focus-within:before:duration-[4000ms]"
      />

      {/* Input area */}
      <div className="relative group">
        <input
          placeholder="Search..."
          type="text"
          className="bg-[#010201] border-none w-[210px] h-[40px] rounded-lg text-white px-[44px] text-sm focus:outline-none placeholder-gray-400"
        />
        <div className="pointer-events-none w-[80px] h-[16px] absolute bg-gradient-to-r from-transparent to-black top-[12px] left-[50px] group-focus-within:hidden" />
        <div className="pointer-events-none w-[24px] h-[16px] absolute bg-[#cf30aa] top-[8px] left-[4px] blur-2xl opacity-80 transition-all duration-[2000ms] group-hover:opacity-0" />

        {/* Filter icon */}
        <div
          className="absolute h-[30px] w-[28px] overflow-hidden top-[5px] right-[5px] rounded-md
                     before:absolute before:content-[''] before:w-[400px] before:h-[400px]
                     before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                     before:rotate-90
                     before:bg-[conic-gradient(rgba(0,0,0,0),#3d3a4f,rgba(0,0,0,0)_50%,rgba(0,0,0,0)_50%,#3d3a4f,rgba(0,0,0,0)_100%)]
                     before:brightness-[1.35] before:animate-spin-slow"
        />
        <div
          className="absolute top-[5px] right-[5px] flex items-center justify-center z-[2]
                     h-[30px] w-[28px] [isolation:isolate] overflow-hidden rounded-md
                     bg-gradient-to-b from-[#161329] via-black to-[#1d1b4b] border border-transparent"
        >
          <svg preserveAspectRatio="none" height="20" width="20" viewBox="4.8 4.56 14.832 15.408" fill="none">
            <path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#d6d6e6" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Search icon */}
        <div className="absolute left-[12px] top-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none">
            <circle stroke="url(#ns)" r="8" cy="11" cx="11" />
            <line stroke="url(#nsl)" y2="16.65" y1="22" x2="16.65" x1="22" />
            <defs>
              <linearGradient gradientTransform="rotate(50)" id="ns">
                <stop stopColor="#f8e7f8" offset="0%" />
                <stop stopColor="#b6a9b7" offset="50%" />
              </linearGradient>
              <linearGradient id="nsl">
                <stop stopColor="#b6a9b7" offset="0%" />
                <stop stopColor="#837484" offset="50%" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  </div>
);

export const Navbar = ({ onMenuClick, pageTitle }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const { theme, toggleTheme } = useTheme();
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
    <nav className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors duration-300" data-testid="navbar">
      <div className="px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: hamburger + title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              data-testid="menu-button"
            >
              <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              {pageTitle}
            </h2>
          </div>

          {/* Right: search + theme toggle + notifications + user */}
          <div className="flex items-center gap-3">
            {/* Animated glowing search bar */}
            <div className="hidden sm:block">
              <NavSearchBar />
            </div>

            {/* Dark / Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>

            {/* Notifications */}
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" data-testid="notifications-bell">
                  <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" data-testid="unread-count-badge">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 dark:bg-slate-800 dark:border-slate-700" align="end">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="font-semibold text-sm dark:text-white">Notifications</h3>
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
                    <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400" data-testid="no-notifications">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.notification_id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                          !notif.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        data-testid={`notification-item-${notif.notification_id}`}
                      >
                        <div className="flex items-start gap-2">
                          {!notif.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                          <div className="flex-1">
                            <p className="text-sm text-slate-900 dark:text-slate-100">{notif.message}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatTimeAgo(notif.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => { navigate('/notifications'); setNotifOpen(false); }}
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
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200" data-testid="user-menu-trigger">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-[#1e3a5f] text-white text-xs">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user?.role]}`}>
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-slate-800 dark:border-slate-700">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{user?.email}</p>
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
