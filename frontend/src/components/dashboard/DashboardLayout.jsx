import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Briefcase, Wallet, User,
  Menu, X, LogOut, Bell, ChevronRight, Shield, Home,
  Settings, Sparkles, UserCheck, Heart, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notifications as notifApi } from '../../api/client';

const takerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Discover' },
  { to: '/dashboard/bookings', icon: Calendar, label: 'My Bookings' },
  { to: '/dashboard/favorites', icon: Heart, label: 'Saved' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];
const providerNavBase = [
  { to: '/dashboard/provider', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/provider/services', icon: Briefcase, label: 'Services' },
  { to: '/dashboard/provider/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/dashboard/provider/earnings', icon: Wallet, label: 'Earnings' },
  { to: '/dashboard/provider/profile', icon: User, label: 'Profile' },
];
const adminNav = [
  { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/admin/providers', icon: UserCheck, label: 'Providers' },
  { to: '/dashboard/admin/services', icon: Briefcase, label: 'All Services' },
  { to: '/dashboard/admin/sos', icon: AlertTriangle, label: 'SOS Alerts' },
  { to: '/dashboard/admin/profile', icon: User, label: 'Profile' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardLayout({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const headerActionsRef = useRef(null);

  const isFemaleProvider = role === 'provider'
    && (user?.provider_profile?.gender === 'female' || user?.gender === 'female');

  const providerNav = isFemaleProvider
    ? [
        ...providerNavBase,
        { to: '/dashboard/provider/sos', icon: AlertTriangle, label: 'Safety / SOS' },
      ]
    : providerNavBase;

  const nav = role === 'admin' ? adminNav : role === 'provider' ? providerNav : takerNav;
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Current page title
  const currentPage = nav.find(n => {
    if (['/dashboard', '/dashboard/provider', '/dashboard/admin'].includes(n.to)) {
      return location.pathname === n.to;
    }
    return location.pathname.startsWith(n.to);
  });

  useEffect(() => {
    notifApi.list({ limit: 10 }).then(({ data }) => {
      setNotifs(data.notifications || []);
      setUnread(data.unreadCount || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!notifOpen && !userMenuOpen) return;
    const onPointerDown = (e) => {
      if (headerActionsRef.current?.contains(e.target)) return;
      setNotifOpen(false);
      setUserMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [notifOpen, userMenuOpen]);

  const handleLogout = () => { logout(); navigate('/'); };

  const roleConfig = {
    admin:    { label: 'Admin',    color: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-300' },
    provider: { label: 'Provider', color: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300' },
    taker:    { label: 'Customer', color: 'text-sky-400',    badge: 'bg-sky-500/15 text-sky-300' },
  };
  const rc = roleConfig[role] || roleConfig.taker;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]" style={{ fontFamily: '"Inter", -apple-system, sans-serif' }}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 flex flex-col z-50
        bg-[#0C1220] text-slate-300
        transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}
        style={{ boxShadow: '1px 0 0 rgba(255,255,255,0.04), 4px 0 24px rgba(0,0,0,0.35)' }}>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm tracking-tight"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              SC
            </div>
            <div className="leading-tight">
              <p className="text-white font-bold text-sm tracking-tight">Serve&Care</p>
              <p className="text-slate-500 text-xs">Platform</p>
            </div>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* User profile */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.05]">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #10B981, #0D9488)' }}>
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0C1220] rounded-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-bold truncate leading-none mb-1.5">
                {user?.full_name || 'User'}
              </p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${rc.badge}`}>
                {rc.label}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={['/dashboard', '/dashboard/provider', '/dashboard/admin'].includes(to)}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-emerald-400 rounded-r-full" />
                  )}
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 pt-3 border-t border-white/[0.06] space-y-1">
          <Link to="/services" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-all">
            <Home size={18} /> Browse Services
          </Link>
          <button type="button" onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] transition-all">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">

        {/* Header */}
        <header className="sticky top-0 z-30 h-16 flex items-center px-5 lg:px-8"
          style={{ background: 'rgba(241,245,249,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>

          <button type="button" onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200/70 transition-colors mr-3">
            <Menu size={22} />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-sm text-slate-400 hidden sm:block">{rc.label} Dashboard</span>
            {currentPage && (
              <>
                <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
                <span className="text-sm font-bold text-slate-700 truncate">{currentPage.label}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5" ref={headerActionsRef}>
            {/* Notifications */}
            <div className="relative">
              <button type="button"
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200/70 transition-colors">
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#F1F5F9]" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl z-50"
                  style={{ boxShadow: '0 4px 6px -2px rgba(0,0,0,0.05), 0 20px 50px -5px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-slate-500" />
                      <p className="text-sm font-bold text-slate-800">Notifications</p>
                    </div>
                    {unread > 0 && (
                      <span className="h-5 px-2.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center">
                        {unread} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifs.length ? notifs.slice(0, 6).map((n, i) => (
                      <div key={n.id} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${i < notifs.length - 1 ? 'border-b border-slate-50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 leading-snug">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center py-10">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
                          <Bell size={20} className="text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">You're all caught up</p>
                      </div>
                    )}
                  </div>
                  <button type="button"
                    onClick={() => notifApi.markAllRead().then(() => { setUnread(0); setNotifOpen(false); })}
                    className="w-full py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors border-t border-slate-100 rounded-b-2xl">
                    Mark all as read
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* User */}
            <div className="relative">
              <button type="button"
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2.5 h-10 pl-2 pr-3 rounded-xl hover:bg-slate-200/70 transition-colors">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #10B981, #0D9488)' }}>
                  {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden sm:block max-w-[130px] truncate">{user?.full_name}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl z-50 overflow-hidden"
                  style={{ boxShadow: '0 4px 6px -2px rgba(0,0,0,0.05), 0 20px 50px -5px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="px-4 py-4 border-b border-slate-50">
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.full_name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors">
                      <Home size={15} className="text-slate-400" /> Back to Home
                    </Link>
                    <button type="button" onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-5 lg:px-8 py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
