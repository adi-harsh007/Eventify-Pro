import React, { useState } from 'react';
import { User, ViewState } from '../types';
import { Sparkles, Compass, Ticket, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  user: User | null;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, currentView, onViewChange, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { label: 'Explore', view: ViewState.EXPLORE, icon: Compass },
    { label: 'My Tickets', view: ViewState.MY_TICKETS, icon: Ticket },
  ];

  if (user.isAdmin) {
    navItems.push({ label: 'Admin', view: ViewState.ADMIN, icon: ShieldCheck });
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* ── Logo ── */}
        <button
          onClick={() => onViewChange(ViewState.EXPLORE)}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Sparkles size={20} className="text-amber-400" />
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            Eventify Pro
          </span>
        </button>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(({ label, view, icon: Icon }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                currentView === view
                  ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  : 'text-white/50 hover:scale-105 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Right: User + Logout ── */}
        <div className="flex items-center gap-3">
          {/* Avatar chip */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none text-white">{user.name}</span>
                <span className={cn(
                  'text-[11px] leading-none mt-0.5',
                  user.isAdmin ? 'text-amber-400' : 'text-white/40'
                )}>
                  {user.isAdmin ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={15} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 md:hidden"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="border-t border-white/5 bg-[#020817]/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map(({ label, view, icon: Icon }) => (
              <button
                key={view}
                onClick={() => { onViewChange(view); setMobileMenuOpen(false); }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  currentView === view
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
            <div className="mt-2 border-t border-white/5 pt-2">
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/40 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
