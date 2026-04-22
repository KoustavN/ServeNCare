import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, MapPin, User, Calendar, Clock, CheckCircle, Navigation,
  ExternalLink, ChevronLeft, ChevronRight, Shield, Zap, ArrowLeft,
  AlertCircle, Heart,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { services as servicesApi, reviews as reviewsApi, favorites as favoritesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25,41], iconAnchor: [12,41] });
L.Marker.prototype.options.icon = DefaultIcon;

const BADGE_CFG = {
  most_trusted: { label: 'Most Trusted', bg: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff' },
  top_rated:    { label: 'Top Rated',    bg: 'linear-gradient(135deg,#D97706,#B45309)', color: '#fff' },
  verified:     { label: 'Verified',     bg: 'linear-gradient(135deg,#059669,#047857)', color: '#fff' },
};

const TYPE_LABEL = { at_customer: "At your location", at_provider: "At provider's location", online: "Online" };

function StarRow({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= rating ? '#F59E0B' : 'none'} color={i <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'} strokeWidth={1.5} />
      ))}
    </div>
  );
}

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    servicesApi.get(id).then(({ data }) => setService(data)).catch(() => setService(null)).finally(() => setLoading(false));
    reviewsApi.byService(id).then(({ data }) => setReviews(data || [])).catch(() => setReviews([]));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'taker') {
      favoritesApi.list().then(({ data: d }) => setIsFavorite((d.favoriteIds || []).includes(id))).catch(() => {});
    } else {
      setIsFavorite(false);
    }
  }, [user?.role, id]);

  const handleToggleFavorite = () => {
    if (user?.role !== 'taker') return;
    const next = !isFavorite;
    const api = next ? favoritesApi.add(id) : favoritesApi.remove(id);
    api.then(() => setIsFavorite(next)).catch(() => {});
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ paddingTop: 100 }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading service…</p>
      </div>
    </div>
  );

  if (!service) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ paddingTop: 100 }}>
      <div className="text-center">
        <p className="text-lg font-bold text-slate-700 mb-3">Service not found.</p>
        <Link to="/services" className="text-emerald-600 font-semibold hover:underline">← Back to services</Link>
      </div>
    </div>
  );

  const hasLocation = service.latitude && service.longitude;
  const mapCenter = hasLocation ? [service.latitude, service.longitude] : [28.6139, 77.2090];
  const googleMapsUrl = hasLocation ? `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}` : null;
  const images = service.images || [];
  const avg = Number(service.avg_rating || 0);

  return (
    <div className="min-h-screen bg-slate-50" style={{ paddingTop: 88, paddingBottom: 48, fontFamily: '"Inter", -apple-system, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">

        {/* Back link */}
        <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6">
          <ArrowLeft size={15} /> Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 items-start">

          {/* ── LEFT: Main content ─────────────────── */}
          <div className="space-y-6">

            {/* Image gallery */}
            {images.length > 0 ? (
              <div className="space-y-3">
                <div className="relative rounded-3xl overflow-hidden bg-slate-200"
                  style={{ height: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
                  <img src={images[selectedImage]} alt={service.title}
                    className="w-full h-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button type="button" onClick={() => setSelectedImage(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                        <ChevronLeft size={18} className="text-slate-700" />
                      </button>
                      <button type="button" onClick={() => setSelectedImage(i => (i + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                        <ChevronRight size={18} className="text-slate-700" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} type="button" onClick={() => setSelectedImage(i)}
                            className={`rounded-full transition-all ${i === selectedImage ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button key={i} type="button" onClick={() => setSelectedImage(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all ${i === selectedImage ? 'ring-2 ring-emerald-500 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl h-56 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)' }}>
                <span className="text-7xl select-none">{service.category_name?.[0] || '✦'}</span>
              </div>
            )}

            {/* Title card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-7"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

              {/* Badges */}
              {(service.badges?.length > 0 || service.service_type === 'online' || (service.recurring_type && service.recurring_type !== 'one_time')) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.badges?.map(b => BADGE_CFG[b] && (
                    <span key={b} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: BADGE_CFG[b].bg, color: BADGE_CFG[b].color }}>
                      {b === 'verified' ? <CheckCircle size={11} /> : b === 'top_rated' ? <Star size={11} /> : <Shield size={11} />}
                      {BADGE_CFG[b].label}
                    </span>
                  ))}
                  {service.service_type === 'online' && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)' }}>💻 Online</span>
                  )}
                  {service.recurring_type && service.recurring_type !== 'one_time' && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
                      🔁 {service.recurring_type.charAt(0).toUpperCase() + service.recurring_type.slice(1)} service
                    </span>
                  )}
                </div>
              )}

              <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">{service.category_name}</p>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-900 leading-tight flex-1">{service.title}</h1>
                {user?.role === 'taker' && (
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors flex-shrink-0 ${
                      isFavorite ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title={isFavorite ? 'Remove from saved' : 'Save for later'}
                  >
                    <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
                    <span className="text-sm font-semibold">{isFavorite ? 'Saved' : 'Save'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap text-sm text-slate-500 mb-5">
                <span>{TYPE_LABEL[service.service_type] || service.service_type}</span>
                {service.payment_frequency === 'monthly' && <><span className="text-slate-300">·</span><span>Monthly payment</span></>}
              </div>

              {/* Price + rating */}
              <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-2xl"
                style={{ background: 'linear-gradient(135deg,#ECFDF5,#F0FDF4)', border: '1px solid #BBF7D0' }}>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5 font-medium">Price</p>
                  <p className="text-3xl font-black text-emerald-700 leading-none">
                    ₹{Number(service.price).toLocaleString()}
                    <span className="text-sm font-semibold text-slate-400 ml-1">
                      {service.price_type === 'hourly' ? '/hr' : service.payment_frequency === 'monthly' ? '/month' : ''}
                    </span>
                  </p>
                </div>
                {avg > 0 && (
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 mb-0.5">
                      <StarRow rating={avg} size={18} />
                      <span className="text-lg font-black text-slate-800">{avg.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-slate-500">{service.review_count || 0} reviews</p>
                  </div>
                )}
              </div>

              {service.description && (
                <p className="text-slate-600 leading-relaxed mt-5 text-base">{service.description}</p>
              )}
            </div>

            {/* Service details */}
            <div className="bg-white rounded-3xl border border-slate-100 p-7"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h2 className="text-base font-black text-slate-900 mb-5">Service Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: MapPin, label: 'Service type', value: TYPE_LABEL[service.service_type] || service.service_type },
                  ...(service.recurring_type && service.recurring_type !== 'one_time' ? [{
                    icon: Clock, label: 'Frequency',
                    value: `${service.recurring_type.charAt(0).toUpperCase() + service.recurring_type.slice(1)} service${service.frequency > 1 ? ` · ${service.frequency}× per ${service.recurring_type === 'daily' ? 'day' : service.recurring_type === 'weekly' ? 'week' : 'month'}` : ''}`,
                  }] : []),
                  ...(service.payment_frequency ? [{
                    icon: Calendar, label: 'Payment',
                    value: service.payment_frequency === 'monthly' ? 'Monthly' : 'Per service',
                  }] : []),
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            {hasLocation && (
              <div className="bg-white rounded-3xl border border-slate-100 p-7"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h2 className="text-base font-black text-slate-900 mb-5">Location</h2>
                {service.address && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Address</p>
                      <p className="text-sm font-semibold text-slate-800">{service.address}</p>
                      {service.radius_km > 0 && service.service_type === 'at_customer' && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                          Service radius: {service.radius_km} km
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="rounded-2xl overflow-hidden border border-slate-100 mb-4" style={{ height: 300, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <MapContainer center={mapCenter} zoom={service.radius_km > 0 ? 11 : 15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={mapCenter}>
                      <Popup><strong>{service.title}</strong><br />{service.address || `${service.latitude?.toFixed(5)}, ${service.longitude?.toFixed(5)}`}</Popup>
                    </Marker>
                    {service.radius_km > 0 && service.service_type === 'at_customer' && (
                      <Circle center={mapCenter} radius={service.radius_km * 1000}
                        pathOptions={{ color: '#059669', fillColor: '#059669', fillOpacity: 0.12, weight: 2 }} />
                    )}
                  </MapContainer>
                </div>
                {googleMapsUrl && (
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}>
                    <Navigation size={15} /> Get Directions
                    <ExternalLink size={13} className="opacity-70" />
                  </a>
                )}
              </div>
            )}

            {/* Provider */}
            <div className="bg-white rounded-3xl border border-slate-100 p-7"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h2 className="text-base font-black text-slate-900 mb-5">About the Provider</h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl overflow-hidden flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#059669,#0D9488)' }}>
                  {service.provider_avatar
                    ? <img src={service.provider_avatar} alt="" className="w-full h-full object-cover" />
                    : (service.provider_name?.[0] || '?')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-base font-black text-slate-900">{service.provider_name}</p>
                    {service.verified && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle size={10} /> Verified
                      </span>
                    )}
                  </div>
                  {service.business_name && <p className="text-sm text-slate-500 mb-1">{service.business_name}</p>}
                  {service.bio && <p className="text-sm text-slate-500 leading-relaxed">{service.bio}</p>}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-3xl border border-slate-100 p-7"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-slate-900">Reviews</h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRow rating={avg} size={14} />
                    <span className="text-sm font-bold text-slate-700">{avg.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({service.review_count || 0})</span>
                  </div>
                )}
              </div>
              {reviews.length ? (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                            {r.taker_name?.charAt(0) || '?'}
                          </div>
                          <p className="text-sm font-bold text-slate-800">{r.taker_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRow rating={r.rating} size={13} />
                          <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star size={28} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No reviews yet. Be the first to book!</p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Book CTA ─────────────────────── */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div className="p-6 border-b border-slate-50">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-lg font-black text-slate-900">Book this service</h3>
                  {avg > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      <span className="text-sm font-bold text-slate-700">{avg.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-2xl font-black text-emerald-600">
                  ₹{Number(service.price).toLocaleString()}
                  <span className="text-sm font-semibold text-slate-400 ml-1">
                    {service.price_type === 'hourly' ? '/hr' : service.payment_frequency === 'monthly' ? '/month' : ''}
                  </span>
                </p>
              </div>

              <div className="p-6">
                {!user ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-slate-500 mb-5">Sign in to book this service</p>
                    <Link to="/login" state={{ from: `/services/${id}` }}
                      className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white rounded-2xl"
                      style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}>
                      Sign in to Book
                    </Link>
                  </div>
                ) : user.role !== 'taker' ? (
                  <div className="flex items-start gap-2.5 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">Use a customer account to book services.</p>
                  </div>
                ) : (
                  <Link
                    to={`/services/${id}/book`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white rounded-2xl transition-all hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
                  >
                    Continue to booking
                  </Link>
                )}
              </div>

              <div className="px-6 pb-6 space-y-2.5">
                {[
                  { icon: Shield, text: 'Secure booking process' },
                  { icon: CheckCircle, text: 'Provider responds within 24h' },
                  { icon: Zap, text: 'Choose date, time & address on next page' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs text-slate-500">
                    <Icon size={13} className="text-emerald-500 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
