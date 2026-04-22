import React, { useState, useEffect } from 'react';
import {
  Save, CheckCircle, User, Mail, Phone, Camera, Clock,
  Calendar, MapPin, ShoppingBag, Info, ChevronRight, Shield,
} from 'lucide-react';
import { auth as authApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'preferences', label: 'Preferences', icon: ShoppingBag },
];

const COMPLETION_FIELDS = [
  { key: 'full_name', label: 'Full name', weight: 30 },
  { key: 'phone', label: 'Phone', weight: 25 },
  { key: 'gender', label: 'Gender', weight: 15 },
  { key: 'address', label: 'Address', weight: 20 },
  { key: 'date_of_birth', label: 'Date of birth', weight: 10 },
];

export default function TakerProfile() {
  const { user: authUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    date_of_birth: '',
    preferred_language: '',
    notification_sms: true,
    notification_email: true,
  });

  useEffect(() => {
    authApi.me().then(({ data }) => {
      setForm((f) => ({
        ...f,
        full_name: data.full_name || data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        address: data.address || '',
        date_of_birth: data.date_of_birth || '',
        preferred_language: data.preferred_language || 'en',
        notification_sms: data.notification_sms ?? true,
        notification_email: data.notification_email ?? true,
      }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const completion = COMPLETION_FIELDS.reduce(
    (acc, { key, weight }) => acc + (form[key] ? weight : 0),
    0
  );
  const missingFields = COMPLETION_FIELDS.filter(({ key }) => !form[key]);

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
    'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all';
  const labelCls = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2';
  const readonlyCls = 'w-full border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-500 bg-slate-50 cursor-not-allowed';

  const completionColor =
    completion >= 80 ? 'bg-sky-500' :
    completion >= 50 ? 'bg-amber-500' :
    'bg-rose-500';

  const joinedDate = authUser?.created_at
    ? new Date(authUser.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading your profile…</p>
      </div>
    );
  }

  const initials = authUser?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── HERO CARD ────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
        {/* Cover */}
        <div className="relative h-36 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 60%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute -bottom-1 left-0 right-0 h-8 bg-white" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', transform: 'scaleX(1.5)' }} />
        </div>

        <div className="px-6 pb-6 -mt-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Avatar + name */}
            <div className="flex items-end gap-5">
              <div className="relative -mt-14 flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl border-4 border-white bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                  {authUser?.avatar_url
                    ? <img src={authUser.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                    : initials}
                </div>
                <button type="button"
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-sky-600 hover:border-sky-300 transition-all"
                  title="Change photo (coming soon)">
                  <Camera size={16} />
                </button>
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{form.full_name || 'Customer'}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{form.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 text-xs font-bold">
                    <User size={11} /> Customer
                  </span>
                  {authUser?.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 text-xs font-bold">
                      <Shield size={11} /> Verified
                    </span>
                  )}
                  {joinedDate && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                      <Clock size={11} /> Joined {joinedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile completion */}
            <div className="min-w-[200px] max-w-[240px] mb-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-600">Profile completeness</span>
                <span className={`text-xs font-bold ${completion >= 80 ? 'text-sky-600' : completion >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {completion}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${completionColor}`}
                  style={{ width: `${completion}%` }}
                />
              </div>
              {missingFields.length > 0 && (
                <p className="text-xs text-slate-400 mt-1.5">
                  Add: {missingFields.slice(0, 3).map(f => f.label).join(', ')}{missingFields.length > 3 ? ` +${missingFields.length - 3}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
            {[
              { icon: ShoppingBag, label: 'Bookings', value: '—', color: 'text-sky-500' },
              { icon: Calendar, label: 'Upcoming', value: '—', color: 'text-emerald-600' },
              { icon: Clock, label: 'Member', value: joinedDate || '—', color: 'text-violet-500' },
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
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
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
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-blue-50">
              <h2 className="text-base font-bold text-slate-900">Personal information</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your account and contact details</p>
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
                    <Info size={11} /> Email cannot be changed
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
                  <label className={labelCls}>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => set({ gender: e.target.value })}
                    className={inputCls}
                  >
                    {GENDER_OPTIONS.map((o) => (
                      <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Date of birth</label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={form.date_of_birth}
                      onChange={(e) => set({ date_of_birth: e.target.value })}
                      className={inputCls + ' pl-10'}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Address / City</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => set({ address: e.target.value })}
                      placeholder="Your city or area"
                      className={inputCls + ' pl-10'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PREFERENCES ── */}
        {activeTab === 'preferences' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-base font-bold text-slate-900">Notification preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">Choose how you want to be notified</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'notification_email', label: 'Email notifications', description: 'Booking confirmations, updates and reminders via email', icon: Mail },
                  { key: 'notification_sms', label: 'SMS notifications', description: 'Booking status updates via SMS to your phone number', icon: Phone },
                ].map(({ key, label, description, icon: Icon }) => (
                  <label key={key} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 cursor-pointer transition-all">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-sky-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(e) => set({ [key]: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        onClick={() => set({ [key]: !form[key] })}
                        className={`w-11 h-6 rounded-full cursor-pointer transition-all ${form[key] ? 'bg-sky-500' : 'bg-slate-200'}`}
                      >
                        <div className={`w-5 h-5 mt-0.5 rounded-full bg-white shadow-sm transition-all ${form[key] ? 'translate-x-5.5 ml-0.5' : 'ml-0.5'}`}
                          style={{ marginLeft: form[key] ? '22px' : '2px' }} />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-base font-bold text-slate-900">Account details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Read-only account information</p>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Account type', value: 'Customer' },
                  { label: 'Verification status', value: authUser?.is_verified ? 'Verified' : 'Unverified' },
                  { label: 'Member since', value: joinedDate || '—' },
                  { label: 'Account ID', value: authUser?.id ? `#${authUser.id.slice(-6).toUpperCase()}` : '—' },
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
            <span>Changes are saved to your account immediately</span>
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
              style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', boxShadow: '0 4px 14px rgba(14,165,233,0.35)' }}
            >
              <Save size={16} /> {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
