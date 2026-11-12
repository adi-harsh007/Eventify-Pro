import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ];

  if (!user.isAdmin) {
    navItems.push({ label: 'My Tickets', view: ViewState.TICKETS, icon: Ticket });
    navItems.push({ label: 'Mega Fest', view: ViewState.MEGA_EVENT, icon: Sparkles });
  }

  if (user.isAdmin) {
    navItems.push({ label: 'Admin', view: ViewState.ADMIN, icon: ShieldCheck });
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#07090F]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => onViewChange(ViewState.EXPLORE)}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-85 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-400 text-slate-950">
            <Sparkles size={16} />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Eventify Pro
          </span>
        </button>

        {/* Desktop Nav Links with layoutId indicator */}
        <div className="hidden items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1 md:flex">
          {navItems.map(({ label, view, icon: Icon }) => {
            const active = currentView === view;
            return (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer',
                  active ? 'text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="navActiveTab"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-white/10 border border-white/10"
                  />
                )}
                <Icon size={15} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: User + Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-amber-400 text-xs font-bold text-slate-950">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-none text-white">{user.name}</span>
                <span
                  className={cn(
                    'text-[11px] leading-none mt-0.5',
                    user.isAdmin ? 'text-amber-300' : 'text-slate-400'
                  )}
                >
                  {user.isAdmin ? 'Organizer' : 'Member'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10 bg-[#07090F]/95 px-4 py-3 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navItems.map(({ label, view, icon: Icon }) => (
                <button
                  key={view}
                  onClick={() => { onViewChange(view); setMobileMenuOpen(false); }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                    currentView === view ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
              <div className="mt-2 border-t border-white/10 pt-2">
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-300/80 hover:bg-rose-500/10"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
