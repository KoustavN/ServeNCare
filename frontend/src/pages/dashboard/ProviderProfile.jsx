import React, { useState, useEffect } from 'react';
import {
  Save, CheckCircle, User, Globe, MapPin, Phone, Building2,
  Briefcase, Award, Camera, Star, Clock, TrendingUp, ExternalLink,
  ChevronRight, Shield, Info,
} from 'lucide-react';
import { provider as providerApi } from '../../api/client';
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
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'professional', label: 'Professional', icon: Award },
  { id: 'location', label: 'Location', icon: MapPin },
];

const COMPLETION_FIELDS = [
  { key: 'business_name', label: 'Business name', weight: 15 },
  { key: 'bio', label: 'Bio', weight: 20 },
  { key: 'tagline', label: 'Tagline', weight: 10 },
  { key: 'website', label: 'Website', weight: 10 },
  { key: 'address', label: 'Address', weight: 15 },
  { key: 'gender', label: 'Gender', weight: 10 },
  { key: 'phone', label: 'Phone', weight: 10 },
  { key: 'experience_years', label: 'Experience', weight: 10 },
];

export default function ProviderProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [form, setForm] = useState({
    business_name: '',
    tagline: '',
    bio: '',
    website: '',
    address: '',
    latitude: '',
    longitude: '',
    radius_km: 10,
    gender: '',
    phone: '',
    experience_years: '',
    certifications: '',
  });

  useEffect(() => {
    providerApi.profile().then(({ data }) => {
      if (data) setForm({
        business_name: data.business_name || '',
        tagline: data.tagline || '',
        bio: data.bio || '',
        website: data.website || '',
        address: data.address || '',
        latitude: data.latitude ?? '',
        longitude: data.longitude ?? '',
        radius_km: data.radius_km ?? 10,
        gender: data.gender || '',
        phone: data.phone || '',
        experience_years: data.experience_years != null ? String(data.experience_years) : '',
        certifications: data.certifications || '',
      });
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

    // Build payload without nulls so backend validators (optional().isFloat / isInt) don't break
    const payload = {
      business_name: form.business_name || '',
      tagline: form.tagline || '',
      bio: form.bio || '',
      website: form.website || '',
      address: form.address || '',
      radius_km: 10,
      gender: form.gender || '',
      phone: form.phone || '',
      certifications: form.certifications || '',
    };
    if (form.latitude) payload.latitude = parseFloat(form.latitude);
    if (form.longitude) payload.longitude = parseFloat(form.longitude);
    if (form.experience_years !== '') {
      payload.experience_years = parseInt(form.experience_years, 10);
    }

    providerApi
      .updateProfile(payload)
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      })
      .catch((err) => alert(err.response?.data?.error || 'Update failed'))
      .finally(() => setSaving(false));
  };

  const inputCls =
    'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all';
  const labelCls = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2';
  const readonlyCls = 'w-full border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-500 bg-slate-50 cursor-not-allowed';

  const completionColor =
    completion >= 80 ? 'bg-emerald-500' :
    completion >= 50 ? 'bg-amber-500' :
    'bg-rose-500';
  const completionLabel =
    completion >= 80 ? 'Complete' :
    completion >= 50 ? 'Good' :
    'Incomplete';

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading your profile…</p>
      </div>
    );
  }

  const initials = user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── HERO CARD ────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
        {/* Cover */}
        <div className="relative h-36 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="absolute -bottom-1 left-0 right-0 h-8 bg-white" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', transform: 'scaleX(1.5)' }} />
        </div>

        <div className="px-6 pb-6 -mt-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Avatar + name */}
            <div className="flex items-end gap-5">
              <div className="relative -mt-14 flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                  {user?.avatar_url
                    ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                    : initials}
                </div>
                <button type="button"
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all"
                  title="Change photo (coming soon)">
                  <Camera size={16} />
                </button>
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{user?.full_name || 'Provider'}</h1>
                {form.tagline && <p className="text-sm text-slate-500 mt-0.5">{form.tagline}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 text-xs font-bold">
                    <Briefcase size={11} /> Service Provider
                  </span>
                  {user?.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 text-xs font-bold">
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
                <span className={`text-xs font-bold ${completion >= 80 ? 'text-emerald-600' : completion >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {completion}% · {completionLabel}
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
                  Missing: {missingFields.slice(0, 3).map(f => f.label).join(', ')}{missingFields.length > 3 ? ` +${missingFields.length - 3}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
            {[
              { icon: Star, label: 'Rating', value: '—', color: 'text-amber-500' },
              { icon: TrendingUp, label: 'Services', value: '—', color: 'text-emerald-600' },
              { icon: Clock, label: 'Response', value: '< 24h', color: 'text-blue-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{value}</p>
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
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: PERSONAL ── */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-base font-bold text-slate-900">Personal information</h2>
              <p className="text-xs text-slate-500 mt-0.5">Basic details about you as a person</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Full name</label>
                  <input
                    type="text"
                    value={user?.full_name || ''}
                    readOnly
                    className={readonlyCls}
                    title="Name cannot be changed here"
                  />
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <Info size={11} /> Managed via account settings
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Email address</label>
                  <input type="email" value={user?.email || ''} readOnly className={readonlyCls} />
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <Info size={11} /> Email cannot be changed
                  </p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
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
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: BUSINESS ── */}
        {activeTab === 'business' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-base font-bold text-slate-900">Business & website</h2>
              <p className="text-xs text-slate-500 mt-0.5">How customers discover and see you</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Business name</label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.business_name}
                      onChange={(e) => set({ business_name: e.target.value })}
                      placeholder="Your company or display name"
                      className={inputCls + ' pl-10'}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Tagline</label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) => set({ tagline: e.target.value })}
                    placeholder="e.g. Trusted home services"
                    className={inputCls}
                    maxLength={120}
                  />
                  <p className="text-xs text-slate-400 mt-1.5">{form.tagline.length} / 120 chars</p>
                </div>
              </div>
              <div>
                <label className={labelCls}>Bio / About</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => set({ bio: e.target.value.slice(0, 500) })}
                  placeholder="Tell customers about your services, experience, and what makes you different."
                  rows={5}
                  className={inputCls + ' resize-none'}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-slate-400">Appears on your public profile and service pages</p>
                  <p className="text-xs text-slate-400">{form.bio.length} / 500</p>
                </div>
              </div>
              <div>
                <label className={labelCls}>Website URL</label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => set({ website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className={inputCls + ' pl-10'}
                  />
                  {form.website && (
                    <a href={form.website} target="_blank" rel="noreferrer"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700">
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PROFESSIONAL ── */}
        {activeTab === 'professional' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
              <h2 className="text-base font-bold text-slate-900">Professional details</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your experience and credentials</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelCls}>Years of experience</label>
                <div className="relative">
                  <TrendingUp size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={0}
                    max={70}
                    value={form.experience_years}
                    onChange={(e) => set({ experience_years: e.target.value })}
                    placeholder="e.g. 5"
                    className={inputCls + ' pl-10'}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Shown on your profile as a trust signal</p>
              </div>
              <div>
                <label className={labelCls}>Certifications & qualifications</label>
                <textarea
                  value={form.certifications}
                  onChange={(e) => set({ certifications: e.target.value })}
                  placeholder="List your certifications, licenses or qualifications. Example:&#10;• ISO 9001 Certified&#10;• NSDC Skill Certificate&#10;• Home Safety License"
                  rows={5}
                  className={inputCls + ' resize-none'}
                />
                <p className="text-xs text-slate-400 mt-1.5">Add each certification on a new line. These boost customer trust.</p>
              </div>

              {/* Trust tip */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <Star size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Boost your visibility</p>
                  <p className="text-xs text-amber-700 mt-0.5">Providers with certifications and 5+ years of experience get up to 40% more booking requests.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: LOCATION ── */}
        {activeTab === 'location' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-base font-bold text-slate-900">Location & service area</h2>
              <p className="text-xs text-slate-500 mt-0.5">Where you operate</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelCls}>Business address</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set({ address: e.target.value })}
                    placeholder="City, area or full address"
                    className={inputCls + ' pl-10'}
                  />
                </div>
              </div>

              {/* Location tip */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 border border-sky-200">
                <Info size={16} className="text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-sky-800">Why location matters</p>
                  <p className="text-xs text-sky-700 mt-0.5">Customers search by proximity. Providing your location helps your services appear in local results.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ChevronRight size={14} />
            {activeTab !== 'location'
              ? <span>Click <strong className="text-slate-700">Save profile</strong> to apply changes across all tabs</span>
              : <span>Your location is used to show your services to nearby customers</span>}
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
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
            >
              <Save size={16} /> {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
