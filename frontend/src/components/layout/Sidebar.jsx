import React, { useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import {
  Home, Building2, Calendar, Ticket, Bell, User, Users, BarChart3, Settings,
  GraduationCap, ChevronsUpDown, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
};

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "4rem" },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: { x: 0, opacity: 1, transition: { x: { stiffness: 1000, velocity: -100 } } },
  closed: { x: -20, opacity: 0, transition: { x: { stiffness: 100 } } },
};

const transitionProps = { type: "tween", ease: "easeOut", duration: 0.2, staggerChildren: 0.1 };
const staggerVariants = { open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } } };

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const menuItems = ROLE_MENUS[user?.role] || ROLE_MENUS.USER;
  const sections = [
    {
      label: 'Main Menu',
      items: menuItems.map(item => ({
        title: item.label,
        url: item.path,
        icon: item.icon
      }))
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const role = user?.role || "USER";

  const sidebarContent = (
    <motion.div
      className={cn("sidebar fixed left-0 top-0 z-[100] h-full shrink-0 sidebar-gradient-bg hidden md:block rounded-r-2xl shadow-[4px_0_24px_rgba(0,0,0,0.4)]")}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div className="relative z-40 flex h-full shrink-0 flex-col transition-all text-black" variants={contentVariants}>
        <motion.ul variants={staggerVariants} className="flex h-full flex-col p-0 m-0">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[72px] w-full shrink-0 border-b border-white/20 p-3 pt-5">
              <div className="flex w-full">
                <Button variant="ghost" className="flex w-full h-full items-center gap-3 justify-start px-2 hover:bg-white/10 cursor-default rounded-xl transition-all">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.6)]">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <motion.li variants={variants} className="flex-1 flex justify-between items-center overflow-hidden list-none">
                    {!isCollapsed && (
                      <div className="flex flex-col items-start text-left">
                        <p className="text-base font-bold font-display text-black tracking-tight leading-none mb-1">Campus Hub</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-black leading-none">{role}</p>
                      </div>
                    )}
                  </motion.li>
                </Button>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4 mt-3">
                <ScrollArea className="h-16 grow px-3">
                  {sections.map((section, sIdx) => (
                    <div key={sIdx} className="w-full flex-col gap-1 mb-5">
                           {section.label && !isCollapsed && (
                         <div className="text-xs font-bold uppercase tracking-[0.15em] text-black/70 px-3 pb-2 mt-2">
                           {section.label}
                         </div>
                       )}
                       {section.items.map((item) => (
                         <NavLink
                           key={item.title}
                           to={item.url}
                           end
                           className={({ isActive }) => cn(
                             "flex h-11 w-full flex-row items-center rounded-xl px-2.5 transition-all duration-300 font-medium my-1 group hover:-translate-y-0.5 hover:shadow-lg",
                             isActive 
                               ? "nav-active-strip text-black font-bold bg-white/10" 
                               : "text-black/70 hover:text-black hover:bg-white/10"
                           )}
                           onClick={onMobileClose}
                         >
                           <div className="flex items-center justify-center shrink-0">
                             <item.icon className={cn("h-5 w-5 transition-all duration-300", "group-hover:icon-glow-cyan")} />
                           </div>
                           <motion.li variants={variants} className="flex-1 overflow-hidden ml-3 list-none">
                             {!isCollapsed && (
                               <p className="text-sm tracking-wide truncate m-0 group-hover:text-black transition-all duration-300">{item.title}</p>
                             )}
                           </motion.li>
                         </NavLink>
                       ))}
                    </div>
                  ))}
                </ScrollArea>
              </div>
              
              <div className="flex flex-col p-3 border-t border-white/20 bg-black/10 backdrop-blur-lg rounded-br-2xl">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex h-12 w-full cursor-pointer flex-row items-center gap-2 rounded-xl px-2 transition-colors hover:bg-white/10 group">
                      <Avatar className="size-8 rounded-lg shadow-sm border border-white/20 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-black font-bold">
                          {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <motion.li variants={variants} className="flex w-full items-center gap-2 overflow-hidden list-none">
                        {!isCollapsed && (
                          <>
                            <div className="flex flex-col flex-1 truncate">
                              <p className="text-sm font-semibold truncate text-black m-0 group-hover:text-black transition-all">{user?.fullName || user?.email || "Account"}</p>
                            </div>
                            <ChevronsUpDown className="h-4 w-4 text-black/50 shrink-0 group-hover:text-black transition-all" />
                          </>
                        )}
                      </motion.li>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={10} align="start" className="w-[200px] glass-card border-black/20 shadow-2xl z-[110] bg-white/95 backdrop-blur-xl text-black">
                    <div className="flex flex-row items-center gap-3 p-3 border-b border-black/10 mb-1 bg-black/5">
                      <Avatar className="size-9 rounded-lg border border-white/10">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-black font-bold">
                          {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-sm font-bold truncate text-black">{user?.fullName || "User"}</span>
                        <span className="text-[10px] text-black/60 truncate font-mono">{user?.email || "user@campushub"}</span>
                      </div>
                    </div>
                    <DropdownMenuItem className="cursor-pointer text-black hover:text-black focus:bg-black/10 focus:text-black py-2.5 mx-1 my-1 rounded-md transition-all group" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4 group-hover:icon-glow-orange" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {sidebarContent}
      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden transition-all duration-300"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 z-[95] md:hidden sidebar-gradient-bg shadow-2xl flex flex-col items-center text-black">
            <div className="flex h-[72px] w-full shrink-0 border-b border-white/20 p-3 pt-5">
              <div className="flex w-full items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.6)]">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col items-start text-left flex-1 overflow-hidden">
                  <p className="text-base font-bold font-display text-black tracking-tight leading-none mb-1 truncate">Campus Hub</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-black leading-none">{role}</p>
                </div>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <ScrollArea className="h-16 grow px-3 py-3 w-full">
                {sections.map((section, sIdx) => (
                  <div key={sIdx} className="w-full flex-col gap-1 mb-5">
                      {section.label && (
                        <div className="text-xs font-bold uppercase tracking-[0.15em] text-black/70 px-3 pb-2 mt-2">
                          {section.label}
                        </div>
                      )}
                      {section.items.map((item) => (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          end
                          className={({ isActive }) => cn(
                            "flex h-11 w-full flex-row items-center rounded-xl px-2.5 transition-all duration-300 font-medium my-1 group hover:-translate-y-0.5 hover:shadow-lg",
                            isActive 
                              ? "nav-active-strip text-black font-bold bg-white/10" 
                              : "text-black/70 hover:text-black hover:bg-white/10 active:scale-[0.98]"
                          )}
                          onClick={onMobileClose}
                        >
                          <div className="flex items-center justify-center shrink-0">
                            <item.icon className={cn("h-5 w-5 transition-all duration-300", "group-hover:icon-glow-cyan")} />
                          </div>
                          <div className="flex-1 overflow-hidden ml-3">
                            <p className="text-sm tracking-wide truncate group-hover:text-black transition-all duration-300">{item.title}</p>
                          </div>
                        </NavLink>
                      ))}
                  </div>
                ))}
              </ScrollArea>
              
              <div className="flex flex-col p-4 border-t border-white/20 bg-black/10 backdrop-blur-lg mt-auto w-full">
                 <Button variant="outline" className="w-full text-black border-black/30 hover:bg-black/10 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all group" onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4 group-hover:icon-glow-orange transition-all" /> Sign out
                 </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};