import React from 'react';
import { TextParallaxContentExample } from '../components/ui/text-parallax-content-scroll';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 font-sans">
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-slate-950/50 border-b border-slate-800">
        <div className="text-2xl font-bold tracking-tighter text-white">Campus HUB</div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            to="/role-selection"
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-950 transition-transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Parallax Content */}
      <TextParallaxContentExample />
    </div>
  );
};
