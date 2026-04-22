import React, { useState, useEffect } from 'react';
import {
  Save, CheckCircle, User, Mail, Phone, Camera, Clock,
  Shield, Database, Server, Activity, LayoutDashboard,
  ChevronRight, Info, Lock,
} from 'lucide-react';
import { auth as authApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'system', label: 'System', icon: Server },
];

export default function AdminProfile() {
  const { user: authUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    authApi.me().then(({ data }) => {
      setForm({
        full_name: data.full_name || data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    authApi
      .updateMe({ fullName: form.full_name, phone: form.phone || null })
      .then(() => {
        refreshUser?.();
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      })
      .catch((err) => alert(err.response?.data?.error || 'Update failed'))
      .finally(() => setSaving(false));
  };

  const inputCls =
    'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all';
  const labelCls = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2';
  const readonlyCls = 'w-full border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-500 bg-slate-50 cursor-not-allowed';

  const joinedDate = authUser?.created_at
    ? new Date(authUser.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-slate-200 border-t-violet-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading your profile…</p>
      </div>
    );
  }

  const initials = authUser?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const accessModules = [
    { icon: LayoutDashboard, label: 'Dashboard overview', level: 'Full access' },
    { icon: Database, label: 'Service management', level: 'Read & Write' },
    { icon: User, label: 'User management', level: 'Full access' },
    { icon: Activity, label: 'Platform analytics', level: 'View only' },
    { icon: Lock, label: 'System settings', level: 'Restricted' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── HERO CARD ────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
        {/* Cover */}
        <div className="relative h-36 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)' }}>
          <div className="absolute inset-0 opacity-15"
            style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.08) 75%), linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.08) 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px' }} />
          <div className="absolute -bottom-1 left-0 right-0 h-8 bg-white" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', transform: 'scaleX(1.5)' }} />
        </div>

        <div className="px-6 pb-6 -mt-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Avatar + name */}
            <div className="flex items-end gap-5">
              <div className="relative -mt-14 flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl border-4 border-white bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                  {authUser?.avatar_url
                    ? <img src={authUser.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                    : initials}
                </div>
                <button type="button"
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-violet-600 hover:border-violet-300 transition-all"
                  title="Change photo (coming soon)">
                  <Camera size={16} />
                </button>
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{form.full_name || 'Admin'}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{form.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-700 text-xs font-bold">
                    <Shield size={11} /> Super Administrator
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 text-xs font-bold">
                    <CheckCircle size={11} /> Verified
                  </span>
                  {joinedDate && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                      <Clock size={11} /> Joined {joinedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Access level badge */}
            <div className="mb-1 p-4 rounded-xl bg-violet-50 border border-violet-200">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-violet-600" />
                <span className="text-xs font-bold text-violet-800 uppercase tracking-wide">Access level</span>
              </div>
              <p className="text-2xl font-black text-violet-700">Level 10</p>
              <p className="text-xs text-violet-600 mt-0.5">Full platform access</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
            {[
              { icon: Database, label: 'Platform', value: 'ServeNCare', color: 'text-violet-500' },
              { icon: Activity, label: 'Status', value: 'Active', color: 'text-emerald-600' },
              { icon: Clock, label: 'Joined', value: joinedDate || '—', color: 'text-blue-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 truncate">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS + FORM ──────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        {/* Tab bar */}
        <div className="flex gap-1 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm mb-5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: PERSONAL ── */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
              <h2 className="text-base font-bold text-slate-900">Personal information</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your admin account details</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Full name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => set({ full_name: e.target.value })}
                    placeholder="Your full name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={form.email} readOnly className={readonlyCls + ' pl-10'} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <Info size={11} /> Admin email cannot be changed
                  </p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Phone number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set({ phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className={inputCls + ' pl-10'}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <input type="text" value="Super Administrator" readOnly className={readonlyCls} />
                </div>
              </div>

              {/* Security tip */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <Shield size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Keep your account secure</p>
                  <p className="text-xs text-amber-700 mt-0.5">As an administrator, your account has elevated privileges. Use a strong, unique password and never share credentials.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: SYSTEM ── */}
        {activeTab === 'system' && (
          <div className="space-y-5">
            {/* Access modules */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-base font-bold text-slate-900">Access & permissions</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your current access level across platform modules</p>
              </div>
              <div className="p-6 space-y-3">
                {accessModules.map(({ icon: Icon, label, level }) => {
                  const levelColor =
                    level === 'Full access' ? 'bg-emerald-100 text-emerald-700' :
                    level === 'Read & Write' ? 'bg-blue-100 text-blue-700' :
                    level === 'View only' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700';
                  return (
                    <div key={label} className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                      <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <Icon size={17} className="text-violet-600" />
                      </div>
                      <p className="flex-1 text-sm font-semibold text-slate-700">{label}</p>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${levelColor}`}>{level}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Account meta */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-base font-bold text-slate-900">Account meta</h2>
                <p className="text-xs text-slate-500 mt-0.5">Read-only system information</p>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Account type', value: 'Administrator' },
                  { label: 'Account status', value: 'Active' },
                  { label: 'Platform', value: 'ServeNCare v1.0' },
                  { label: 'Account ID', value: authUser?.id ? `#${authUser.id.slice(-8).toUpperCase()}` : '—' },
                  { label: 'Member since', value: joinedDate || '—' },
                  { label: 'Last login', value: 'Just now' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ChevronRight size={14} />
            <span>Changes to your name and phone are applied immediately</span>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <CheckCircle size={17} /> Saved!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-7 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}
            >
              <Save size={16} /> {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
