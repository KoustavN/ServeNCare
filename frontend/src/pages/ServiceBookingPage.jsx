import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Clock, FileText, Navigation,
  CheckCircle, AlertCircle, Loader2, MapPinned,
} from 'lucide-react';
import { services as servicesApi, bookings as bookingsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const TYPE_LABEL = { at_customer: 'At your location', at_provider: "At provider's location", online: 'Online' };

/** Reverse geocode lat,lng to address using OpenStreetMap Nominatim (free, no key) */
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
      'User-Agent': 'ServeNCareBooking/1.0 (Contact: booking@servencare.local)',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.display_name || data.address ? [
    data.address?.road,
    data.address?.suburb || data.address?.neighbourhood,
    data.address?.city || data.address?.town || data.address?.village,
    data.address?.state,
    data.address?.country,
  ].filter(Boolean).join(', ') : null;
}

export default function ServiceBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: '',
    time: '',
    taker_address: '',
    taker_lat: null,
    taker_lng: null,
    notes: '',
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    servicesApi.get(id).then(({ data }) => setService(data)).catch(() => setService(null)).finally(() => setLoading(false));
  }, [id]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleUseCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location. Please enter your address manually.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        set({ taker_lat: lat, taker_lng: lng });
        try {
          const address = await reverseGeocode(lat, lng);
          set({ taker_address: address || `Current location (${lat.toFixed(5)}, ${lng.toFixed(5)})` });
        } catch {
          set({ taker_address: `Current location (${lat.toFixed(5)}, ${lng.toFixed(5)})` });
        }
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(err.message || 'Could not get your location. Please enter your address manually.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!user) {
      navigate('/login', { state: { from: `/services/${id}/book` } });
      return;
    }
    if (user.role !== 'taker') {
      setSubmitError('Only customers can book services. Please use a customer account.');
      return;
    }
    const [y, m, d] = (form.date || '').split('-');
    const [hh, mm] = (form.time || '').split(':');
    if (!y || !hh) {
      setSubmitError('Please select date and time.');
      return;
    }
    const scheduled = new Date(Date.UTC(+y, +m - 1, +d, +hh, +(mm || 0)));
    if (scheduled.getTime() < Date.now()) {
      setSubmitError('Please choose a future date and time.');
      return;
    }
    if (service?.service_type === 'at_customer' && !form.taker_address?.trim()) {
      setSubmitError('Please enter your address or use "Use my current location".');
      return;
    }
    setSubmitting(true);
    bookingsApi
      .create({
        service_id: id,
        scheduled_at: scheduled.toISOString(),
        taker_address: form.taker_address?.trim() || undefined,
        taker_lat: form.taker_lat ?? undefined,
        taker_lng: form.taker_lng ?? undefined,
        notes: form.notes?.trim() || undefined,
      })
      .then(() => setSuccess(true))
      .catch((err) => setSubmitError(err.response?.data?.error || 'Booking request failed.'))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ paddingTop: 100 }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ paddingTop: 100 }}>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700 mb-3">Service not found.</p>
          <Link to="/services" className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1.5">
            <ArrowLeft size={16} /> Back to services
          </Link>
        </div>
      </div>
    );
  }

  const needsAddress = service.service_type === 'at_customer';
  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white';
  const labelCls = 'block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2';

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5" style={{ paddingTop: 100, paddingBottom: 48 }}>
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Booking request sent</h1>
          <p className="text-slate-500 mb-6">
            The provider will review and confirm your booking. You’ll see updates in My Bookings.
          </p>
          <Link
            to="/dashboard/bookings"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}
          >
            View My Bookings
          </Link>
          <Link to={`/services/${id}`} className="block mt-4 text-sm font-semibold text-slate-500 hover:text-slate-700">
            ← Back to service
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ paddingTop: 88, paddingBottom: 48, fontFamily: '"Inter", -apple-system, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-5 lg:px-8">
        <Link
          to={`/services/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to service
        </Link>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Book this service</h1>
        <p className="text-slate-500 mb-8">Confirm details and send your request. The provider will confirm shortly.</p>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-8 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order summary</p>
          <div className="flex gap-4">
            {service.images?.[0] ? (
              <img src={service.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
                {service.category_name?.[0] || '•'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-900 truncate">{service.title}</h2>
              <p className="text-sm text-slate-500">{service.category_name} · {TYPE_LABEL[service.service_type] || service.service_type}</p>
              <p className="text-lg font-black text-emerald-600 mt-1">
                ₹{Number(service.price).toLocaleString()}
                <span className="text-sm font-semibold text-slate-400 ml-1">
                  {service.price_type === 'hourly' ? '/hr' : service.payment_frequency === 'monthly' ? '/month' : ''}
                </span>
              </p>
            </div>
          </div>
        </div>

        {!user ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-slate-700 font-semibold mb-4">Sign in to request this booking</p>
            <Link
              to="/login"
              state={{ from: `/services/${id}/book` }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}
            >
              Sign in to continue
            </Link>
          </div>
        ) : user.role !== 'taker' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 font-medium">Use a customer account to book services.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date & time */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Calendar size={14} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800">Date & time</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set({ date: e.target.value })}
                    min={new Date().toISOString().slice(0, 10)}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => set({ time: e.target.value })}
                    required
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Your address (when service is at customer location) */}
            {needsAddress && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MapPin size={14} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Your address</h3>
                </div>
                <p className="text-sm text-slate-500 mb-3">Where should the provider come? You can type your address or use your current location.</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={form.taker_address}
                    onChange={(e) => set({ taker_address: e.target.value })}
                    placeholder="Street, area, city, PIN"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locationLoading}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {locationLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <MapPinned size={16} />
                    )}
                    {locationLoading ? 'Getting location…' : 'Use current location'}
                  </button>
                </div>
                {locationError && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5 mt-2">
                    <AlertCircle size={14} /> {locationError}
                  </p>
                )}
                {form.taker_lat != null && form.taker_lng != null && (
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Navigation size={10} /> Location saved (lat, lng)
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FileText size={14} className="text-slate-600" />
                </div>
                <h3 className="font-bold text-slate-800">Notes <span className="font-normal text-slate-400">(optional)</span></h3>
              </div>
              <textarea
                value={form.notes}
                onChange={(e) => set({ notes: e.target.value })}
                placeholder="Special requests, access instructions, etc."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>

            {submitError && (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-base font-bold text-white rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending request…
                </>
              ) : (
                'Request booking'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
