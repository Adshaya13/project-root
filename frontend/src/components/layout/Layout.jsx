import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout = ({ children, pageTitle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="md:pl-16">
        <Navbar onMenuClick={() => setMobileOpen(true)} pageTitle={pageTitle} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
