import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Calendar, Settings, ArrowRight, Shield, Activity, UserCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import { admin as adminApi } from '../../api/client';

const modules = [
  {
    to: '/dashboard/admin/services',
    icon: Briefcase,
    label: 'All Services',
    desc: 'View and moderate all service listings on the platform.',
    color: '#059669', bg: '#ECFDF5',
    active: true,
  },
  {
    to: '/dashboard/admin/providers',
    icon: Users,
    label: 'Providers',
    desc: 'Verify new providers so they can post services.',
    color: '#2563EB', bg: '#EFF6FF',
    active: true,
  },
  {
    to: '/dashboard/admin/sos',
    icon: AlertTriangle,
    label: 'SOS Alerts',
    desc: 'View and coordinate active safety incidents.',
    color: '#DC2626', bg: '#FEF2F2',
    active: true,
  },
  {
    to: null,
    icon: Calendar,
    label: 'Bookings',
    desc: 'Track all bookings and resolve disputes.',
    color: '#7C3AED', bg: '#F5F3FF',
    active: false,
  },
  {
    to: null,
    icon: Settings,
    label: 'Platform Settings',
    desc: 'Commission rates, policies, and notifications.',
    color: '#D97706', bg: '#FFFBEB',
    active: false,
  },
];

export default function DashboardAdmin() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.stats().then(({ data }) => setStats(data)).catch(() => setStats(null));
  }, []);

  const s = stats || {};
  const statCards = [
    { label: 'Platform Health', value: 'Operational', icon: Activity, bar: '#ECFDF5', dot: '#059669' },
    { label: 'Customers', value: s.customers != null ? s.customers : '—', icon: Users, bar: '#EFF6FF', dot: '#2563EB' },
    { label: 'Providers', value: s.providers != null ? s.providers : '—', icon: UserCheck, bar: '#F5F3FF', dot: '#7C3AED' },
    { label: 'Services', value: s.services != null ? s.services : '—', icon: Briefcase, bar: '#ECFDF5', dot: '#059669' },
    { label: 'Total Bookings', value: s.bookings != null ? s.bookings : '—', icon: Calendar, bar: '#EFF6FF', dot: '#2563EB' },
    { label: 'Completed', value: s.completedBookings != null ? s.completedBookings : '—', icon: Calendar, bar: '#D1FAE5', dot: '#047857' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', boxShadow: '0 4px 24px rgba(30,27,75,0.35)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #A78BFA, transparent)', transform: 'translate(20%, -40%)' }} />
        <div className="relative px-6 py-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(167,139,250,0.2)' }}>
              <Shield size={14} style={{ color: '#C4B5FD' }} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#A78BFA' }}>Admin Panel</span>
          </div>
          <h1 className="text-[26px] font-bold text-white leading-tight mb-1">Platform Overview</h1>
          <p className="text-[13px]" style={{ color: '#A5B4FC' }}>Manage users, services, bookings, and platform settings.</p>
        </div>
      </div>

      {s.pendingProviders > 0 && (
        <Link to="/dashboard/admin/providers?verified=false"
          className="flex items-center gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertCircle size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">{s.pendingProviders} provider{s.pendingProviders !== 1 ? 's' : ''} pending verification</p>
            <p className="text-xs text-amber-700">Verify them so they can post services.</p>
          </div>
          <ArrowRight size={18} className="text-amber-600 ml-auto" />
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, bar, dot }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `3px solid ${dot}` }}>
            <div className="w-8 h-8 rounded-xl mb-2 flex items-center justify-center" style={{ background: bar }}>
              <Icon size={14} style={{ color: dot }} />
            </div>
            <p className="text-[16px] font-black text-slate-900">{value}</p>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div>
        <h2 className="text-[14px] font-bold text-slate-700 mb-3 uppercase tracking-wider">Management Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modules.map(({ to, icon: Icon, label, desc, color, bg, active }) => {
            const inner = (
              <div className={`flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 transition-all duration-200 overflow-hidden
                ${active ? 'hover:shadow-lg hover:border-slate-200 cursor-pointer' : 'opacity-55'}
              `} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[13px] font-bold text-slate-800">{label}</h3>
                    {!active && (
                      <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                        style={{ background: '#F1F5F9', color: '#94A3B8' }}>
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{desc}</p>
                  {active && (
                    <p className="flex items-center gap-1 text-[12px] font-bold mt-2" style={{ color }}>
                      Manage <ArrowRight size={12} />
                    </p>
                  )}
                </div>
              </div>
            );
            return active && to
              ? <Link key={label} to={to}>{inner}</Link>
              : <div key={label}>{inner}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
