import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, User, Building2, Shield, Menu, X, ChevronRight } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'hospital') return '/hospital/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Find Blood', path: '/find-blood' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Rapid Role Evaluator Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] whitespace-nowrap">
            <span className="text-slate-400 font-medium">Quick Role Switcher:</span>
            <button
              onClick={() => switchDemoRole('admin')}
              className="px-2 py-0.5 rounded text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Admin Director
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => switchDemoRole('verified_hospital')}
              className="px-2 py-0.5 rounded text-emerald-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Verified Hospital (Metro)
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => switchDemoRole('pending_hospital')}
              className="px-2 py-0.5 rounded text-yellow-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Pending Hospital (St. Jude)
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => switchDemoRole('screened_donor')}
              className="px-2 py-0.5 rounded text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Eligible Donor (Sarah O-)
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => switchDemoRole('new_donor')}
              className="px-2 py-0.5 rounded text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              New Donor (Elena)
            </button>
          </div>
          <a
            href="/api/docs/postman"
            download
            className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            Postman API Docs
          </a>
        </div>
      </div>

      {/* Main Top Bar adhering strictly to 3-zone contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold shadow-sm">
              <span className="text-sm font-black">🩸</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Smart Blood Connect
            </span>
          </button>

          {/* Zone 2: 4-5 concise single-line text links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`hover:text-red-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive ? 'text-red-600 font-semibold border-b-2 border-red-600 pb-0.5' : ''
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {user.role === 'hospital' && <Building2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {user.role === 'donor' && <User className="w-3.5 h-3.5 text-rose-400" />}
                  {user.role === 'admin' && <Shield className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{user.name.split(' ')[0]}'s Portal</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-red-600"
              >
                {link.label}
              </button>
            ))}
            {user ? (
              <button
                onClick={() => {
                  navigate(getDashboardPath());
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-semibold text-red-600"
              >
                Open Dashboard ({user.role})
              </button>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-white bg-red-600 rounded-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
