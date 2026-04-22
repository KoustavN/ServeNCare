import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Calendar, Wallet, TrendingUp,
  ArrowRight, Clock, CheckCircle, AlertCircle, Plus, ArrowUpRight, ShieldAlert,
} from 'lucide-react';
import { provider as providerApi, bookings as bookingsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, accent, link }) {
  const inner = (
    <div className={`relative bg-white rounded-2xl p-5 border overflow-hidden transition-all duration-200
      ${link ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : ''}
    `}
      style={{
        borderLeft: accent ? `3px solid ${accent}` : '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={22} style={{ color: iconColor }} />
        </div>
        {link && <ArrowUpRight size={16} className="text-slate-300 mt-1" />}
      </div>
      <p className="text-2xl font-black text-slate-900 leading-none mb-1.5">{value}</p>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
}

export default function DashboardProvider() {
  const [earnings, setEarnings] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    providerApi.earnings().then(({ data }) => setEarnings(data)).catch(() => {});
    bookingsApi.list({ status: 'pending' }).then(({ data }) => setPendingCount(data.bookings?.length ?? 0)).catch(() => {});
    bookingsApi.list({ limit: 5 }).then(({ data }) => setRecentBookings(data.bookings?.slice(0, 5) || [])).catch(() => {});
  }, []);

  const totalEarnings = earnings?.total_earnings ?? 0;
  const pendingPayout = earnings?.pending_earnings ?? 0;
  const completedEarnings = earnings?.completed_earnings ?? 0;
  const isVerified = !!user?.is_verified;

  const STATUS_STYLE = {
    pending:   { dot: '#F59E0B', text: 'text-amber-600',   bg: 'bg-amber-50' },
    confirmed: { dot: '#3B82F6', text: 'text-blue-600',    bg: 'bg-blue-50' },
    completed: { dot: '#10B981', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    cancelled: { dot: '#EF4444', text: 'text-red-500',     bg: 'bg-red-50' },
  };

  return (
    <div className="space-y-6">

      {/* ── VERIFICATION PENDING ───────────────────── */}
      {!isVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-wrap items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={24} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-amber-900">Account pending verification</h2>
            <p className="text-sm text-amber-800 mt-0.5">Your account must be verified by an admin before you can post new services. You can still update your profile and view existing services.</p>
          </div>
        </div>
      )}

      {/* ── WELCOME BANNER ─────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10B981, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', transform: 'translate(-30%, 30%)' }} />
        <div className="relative px-8 py-8 flex items-center justify-between gap-6">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">{getGreeting()}</p>
            <h1 className="text-4xl font-black text-white leading-tight mb-2">{firstName}</h1>
            <p className="text-slate-400 text-base">Here's what's happening with your business today.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {pendingCount > 0 && (
              <Link to="/dashboard/provider/bookings"
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.25)' }}>
                <AlertCircle size={15} /> {pendingCount} pending
              </Link>
            )}
            {isVerified ? (
              <Link to="/dashboard/provider/services/new"
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }}>
                <Plus size={15} /> Add Service
              </Link>
            ) : (
              <span className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl bg-slate-500/20 text-slate-400 border border-slate-400/30 cursor-not-allowed" title="Verify your account to add services">
                <Plus size={15} /> Add Service
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Requests"  value={pendingCount}
          icon={Clock}        iconBg="#FEF3C7" iconColor="#D97706" accent="#F59E0B"
          link="/dashboard/provider/bookings" />
        <StatCard label="Total Earnings"    value={`₹${Number(totalEarnings).toLocaleString()}`}
          icon={Wallet}       iconBg="#D1FAE5" iconColor="#059669" accent="#10B981"
          link="/dashboard/provider/earnings" />
        <StatCard label="Pending Payout"    value={`₹${Number(pendingPayout).toLocaleString()}`}
          icon={TrendingUp}   iconBg="#DBEAFE" iconColor="#2563EB" accent="#3B82F6"
          link="/dashboard/provider/earnings" />
        <StatCard label="Completed Revenue" value={`₹${Number(completedEarnings).toLocaleString()}`}
          icon={CheckCircle}  iconBg="#EDE9FE" iconColor="#7C3AED" />
      </div>

      {/* ── BOTTOM GRID ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <h2 className="text-base font-bold text-slate-800">Recent Bookings</h2>
            <Link to="/dashboard/provider/bookings"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentBookings.length ? (
            <div className="divide-y divide-slate-50">
              {recentBookings.map(b => {
                const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                return (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${st.bg} flex items-center justify-center font-bold text-sm flex-shrink-0`}
                      style={{ color: st.dot }}>
                      {b.service_title?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{b.service_title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {b.taker_name} · {new Date(b.scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-700">₹{Number(b.amount).toLocaleString()}</p>
                      <p className={`text-xs font-bold capitalize ${st.text} mt-0.5`}>{b.status}</p>
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
              <p className="text-base font-bold text-slate-600 mb-1">No bookings yet</p>
              <p className="text-sm text-slate-400">Bookings from customers will show here.</p>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          {[
            { to: '/dashboard/provider/services', icon: Briefcase, label: 'My Services',  desc: 'Manage listings',       color: '#059669', bg: '#ECFDF5' },
            { to: '/dashboard/provider/bookings', icon: Calendar,  label: 'Bookings',     desc: 'Accept & complete',    color: '#2563EB', bg: '#EFF6FF' },
            { to: '/dashboard/provider/earnings', icon: Wallet,    label: 'Earnings',     desc: 'Payouts & history',    color: '#7C3AED', bg: '#F5F3FF' },
            { to: '/dashboard/provider/profile',  icon: Briefcase, label: 'Profile',      desc: 'Business details',     color: '#D97706', bg: '#FFFBEB' },
          ].map(({ to, icon: Icon, label, desc, color, bg }) => (
            <Link key={to} to={to}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200 group"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <ArrowRight size={15} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
