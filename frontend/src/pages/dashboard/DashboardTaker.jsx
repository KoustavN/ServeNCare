import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, ArrowRight, Star, Zap, Shield } from 'lucide-react';
import { bookings as bookingsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardTaker() {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    bookingsApi.list({ limit: 5 }).then(({ data }) => {
      setRecentBookings(data.bookings?.slice(0, 5) || []);
    }).catch(() => {});
  }, []);

  const STATUS_STYLE = {
    pending:   { dot: 'bg-amber-400',   label: 'Pending',   text: 'text-amber-600',   bg: 'bg-amber-50' },
    confirmed: { dot: 'bg-blue-400',    label: 'Confirmed', text: 'text-blue-600',     bg: 'bg-blue-50' },
    completed: { dot: 'bg-emerald-400', label: 'Completed', text: 'text-emerald-600',  bg: 'bg-emerald-50' },
    cancelled: { dot: 'bg-red-400',     label: 'Cancelled', text: 'text-red-500',      bg: 'bg-red-50' },
  };

  return (
    <div className="space-y-6">

      {/* ── HERO ────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)', boxShadow: '0 8px 32px rgba(5,150,105,0.3)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(20%, -45%)' }} />
        <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translateY(50%)' }} />
        <div className="relative px-8 py-8 flex items-center justify-between gap-6">
          <div>
            <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-2">{getGreeting()}</p>
            <h1 className="text-4xl font-black text-white leading-tight mb-2">{firstName} 👋</h1>
            <p className="text-emerald-100/80 text-base max-w-sm">Find and book trusted service providers near you.</p>
          </div>
          <Link to="/services"
            className="flex-shrink-0 flex items-center gap-2.5 text-sm font-bold px-6 py-3 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 transition-colors"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <Search size={16} /> Find Services
          </Link>
        </div>
      </div>

      {/* ── MAIN GRID ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Action cards */}
        <div className="space-y-3">
          {[
            {
              to: '/services',
              icon: Search, label: 'Browse Services', desc: 'Search by location, category, or keyword',
              color: '#059669', bg: '#ECFDF5',
            },
            {
              to: '/dashboard/bookings',
              icon: Calendar, label: 'My Bookings', desc: 'View upcoming and past bookings',
              color: '#2563EB', bg: '#EFF6FF',
            },
            {
              to: '/services?map=1',
              icon: MapPin, label: 'Map View', desc: 'See nearby providers on a live map',
              color: '#7C3AED', bg: '#F5F3FF',
            },
          ].map(({ to, icon: Icon, label, desc, color, bg }) => (
            <Link key={to} to={to}
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200 group"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-800">{label}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* Recent bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <h2 className="text-base font-bold text-slate-800">Recent Bookings</h2>
            <Link to="/dashboard/bookings"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentBookings.length ? (
            <div className="divide-y divide-slate-50">
              {recentBookings.map(b => {
                const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                return (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center font-bold text-sm text-slate-600 flex-shrink-0`}>
                      {b.service_title?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{b.service_title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {b.provider_name} · {new Date(b.scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      <span className={`text-xs font-bold ${st.text}`}>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16">
              <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                <Calendar size={24} className="text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-600 mb-1.5">No bookings yet</p>
              <p className="text-sm text-slate-400 mb-5">Book your first service today</p>
              <Link to="/services"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                Browse Services <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── TRUST STRIP ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Shield, label: 'Verified Providers', desc: 'All providers are background checked' },
          { icon: Star,   label: 'Rated & Reviewed',   desc: 'Real reviews from real customers' },
          { icon: Zap,    label: 'Fast Booking',        desc: 'Confirm in under 60 seconds' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
