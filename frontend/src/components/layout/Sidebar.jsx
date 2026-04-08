import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import {
  Home,
  Building2,
  Calendar,
  Ticket,
  Bell,
  User,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_MENUS = {
  USER: [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Building2, label: 'Browse Resources', path: '/resources' },
    { icon: Calendar, label: 'My Bookings', path: '/bookings/my' },
    { icon: Ticket, label: 'My Tickets', path: '/tickets/my' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'My Profile', path: '/profile' },
  ],
  ADMIN: [
    { icon: Home, label: 'Admin Dashboard', path: '/admin/dashboard' },
    { icon: Building2, label: 'Resource Management', path: '/admin/resources' },
    { icon: Calendar, label: 'All Bookings', path: '/admin/bookings' },
    { icon: Ticket, label: 'All Tickets', path: '/admin/tickets' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ],
  TECHNICIAN: [
    { icon: Home, label: 'My Dashboard', path: '/technician/dashboard' },
    { icon: Ticket, label: 'Assigned Tickets', path: '/technician/tickets' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'My Profile', path: '/profile' },
  ],
  MANAGER: [
    { icon: Home, label: 'Manager Dashboard', path: '/manager/dashboard' },
    { icon: Building2, label: 'Resources Overview', path: '/manager/resources' },
    { icon: Calendar, label: 'Booking Approvals', path: '/manager/bookings' },
    { icon: Ticket, label: 'Ticket Overview', path: '/manager/tickets' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'My Profile', path: '/profile' },
  ],
};

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const menuItems = ROLE_MENUS[user?.role] || ROLE_MENUS.USER;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1e3a5f] text-white">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Campus Hub</h1>
          <button onClick={onMobileClose} className="lg:hidden" data-testid="close-sidebar">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-xs text-white/60 mt-1">Operations Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" data-testid="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white border-l-4 border-[#f97316]'
                  : 'text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
              )}
              data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="h-5 w-5" strokeWidth={2} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40">
          Logged in as <span className="text-white/60 font-medium">{user?.role}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0" data-testid="sidebar-desktop">
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileClose}
            data-testid="sidebar-overlay"
          />
          <div className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden" data-testid="sidebar-mobile">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
};
