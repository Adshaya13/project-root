import React from 'react';
import { TextParallaxContentExample } from '../components/ui/text-parallax-content-scroll';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0f111a] font-sans transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex items-center gap-12">
          <div className="text-2xl font-bold tracking-tighter text-orange-500 font-['Cabinet_Grotesk']">Campus HUB</div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">Pricing</a>
            <a href="#" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">About Us</a>
            <a href="#" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">Support</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-orange-500"
          >
            Log in
          </Link>
          <Link
            to="/role-selection"
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white transition-transform hover:scale-105 shadow-md shadow-orange-500/20"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Parallax Content */}
      <TextParallaxContentExample />
    </div>
  );
};
