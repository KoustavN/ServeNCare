import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Star, MapPin, ArrowRight, LayoutGrid, Map,
  Navigation, Clock, User, ChevronDown, ChevronUp,
  SlidersHorizontal, X, CheckCircle2, Heart,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { services as servicesApi, categories as categoriesApi, favorites as favoritesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ServicesMap from '../components/ServicesMap';

const SERVICE_TYPES = [
  { value: 'at_customer', label: 'At my location', icon: '🏠' },
  { value: 'at_provider', label: 'At provider',    icon: '🏪' },
  { value: 'online',      label: 'Online',          icon: '💻' },
];
const SORT_OPTIONS = [
  { value: 'rating',     label: 'Top Rated' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest' },
];

const BADGE_CFG = {
  most_trusted: { label: 'Most Trusted', style: { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff' } },
  top_rated:    { label: 'Top Rated',    style: { background: 'linear-gradient(135deg,#D97706,#B45309)', color: '#fff' } },
  verified:     { label: 'Verified',     style: { background: 'linear-gradient(135deg,#059669,#047857)', color: '#fff' } },
};

function ServiceCard({ s, isFavorite, onToggleFavorite }) {
  const badges = (s.badges || []).slice(0, 1);
  const typeLabel = { at_customer: 'At your location', at_provider: 'At provider', online: 'Online' };

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(s.id);
  };

  return (
    <Link to={`/services/${s.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

      {/* Image / placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex-shrink-0">
        {s.images?.[0] ? (
          <img src={s.images[0]} alt={s.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)' }}>
            <span className="text-5xl select-none">{s.category_name?.[0] || '✦'}</span>
          </div>
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {badges.map(b => (
            <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={BADGE_CFG[b]?.style}>
              {BADGE_CFG[b]?.label}
            </span>
          ))}
          {s.recurring_type && s.recurring_type !== 'one_time' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
              {s.recurring_type.charAt(0).toUpperCase() + s.recurring_type.slice(1)}
            </span>
          )}
          {s.service_type === 'online' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
              style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)' }}>
              Online
            </span>
          )}
        </div>
        {/* Rating pill */}
        {s.avg_rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
            <Star size={11} fill="#F59E0B" color="#F59E0B" />
            <span className="text-xs font-bold text-slate-700">{Number(s.avg_rating).toFixed(1)}</span>
          </div>
        )}
        {/* Favorite heart (taker only) */}
        {onToggleFavorite != null && (
          <button
            type="button"
            onClick={handleHeartClick}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors"
            title={isFavorite ? 'Remove from saved' : 'Save for later'}
          >
            <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{s.category_name}</p>
        <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug line-clamp-2">{s.title}</h3>

        {s.description && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-3">{s.description}</p>
        )}

        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={11} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{typeLabel[s.service_type] || s.service_type}
              {s.address && ` · ${s.address.split(',')[0]}`}
            </span>
          </div>
          {s.provider_name && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User size={11} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{s.provider_name}</span>
            </div>
          )}
          {s.distance_km != null && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <Navigation size={11} />
              {s.distance_km.toFixed(1)} km away
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">From</p>
            <p className="text-lg font-black text-emerald-600 leading-none">
              ₹{Number(s.price).toLocaleString()}
              <span className="text-xs font-semibold text-slate-400 ml-0.5">
                {s.price_type === 'hourly' ? '/hr' : s.payment_frequency === 'monthly' ? '/mo' : ''}
              </span>
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}>
            View <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ServicesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ services: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('categories') ? searchParams.get('categories').split(',') : []
  );
  const [selectedServiceTypes, setSelectedServiceTypes] = useState(
    searchParams.get('types') ? searchParams.get('types').split(',') : []
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');
  const [mapView, setMapView] = useState(searchParams.get('map') === '1');
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [filterByLocation, setFilterByLocation] = useState(false);
  const [radius, setRadius] = useState(50);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catExpanded, setCatExpanded] = useState(true);
  const [typeExpanded, setTypeExpanded] = useState(true);

  useEffect(() => {
    categoriesApi.list().then(({ data: d }) => setCategories(d || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role === 'taker') {
      favoritesApi.list().then(({ data: d }) => setFavoriteIds(d.favoriteIds || [])).catch(() => {});
    } else {
      setFavoriteIds([]);
    }
  }, [user?.role]);

  useEffect(() => {
    setLoading(true);
    const params = {
      q: q || undefined,
      ...(selectedCategories.length > 0 ? { category: selectedCategories[0] } : {}),
      sort,
      ...(selectedServiceTypes.length > 0 ? { type: selectedServiceTypes[0] } : {}),
      limit: 24,
      ...(filterByLocation && userLocation.lat ? { lat: userLocation.lat, lng: userLocation.lng, radius } : {}),
    };
    servicesApi.list(params).then(({ data: d }) => {
      let filtered = d.services || [];
      if (selectedCategories.length > 0) filtered = filtered.filter(s => selectedCategories.includes(s.category_id));
      if (selectedServiceTypes.length > 0) filtered = filtered.filter(s => selectedServiceTypes.includes(s.service_type));
      setData({ ...d, services: filtered });
    }).catch(() => setData({ services: [], total: 0 })).finally(() => setLoading(false));
  }, [q, selectedCategories, sort, selectedServiceTypes, filterByLocation, userLocation, radius]);

  const updateQuery = (k, v) => {
    const next = new URLSearchParams(searchParams);
    if (v) next.set(k, v); else next.delete(k);
    setSearchParams(next);
  };

  const toggleCategory = (id) => {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter(c => c !== id)
      : [...selectedCategories, id];
    setSelectedCategories(next);
    updateQuery('categories', next.length ? next.join(',') : null);
  };

  const toggleType = (t) => {
    const next = selectedServiceTypes.includes(t)
      ? selectedServiceTypes.filter(x => x !== t)
      : [...selectedServiceTypes, t];
    setSelectedServiceTypes(next);
    updateQuery('types', next.length ? next.join(',') : null);
  };

  const handleLocation = () => {
    if (filterByLocation) { setFilterByLocation(false); setUserLocation({ lat: null, lng: null }); return; }
    if (!navigator.geolocation) { Swal.fire({ icon: 'error', title: 'Not supported', text: 'Your browser does not support geolocation.' }); return; }
    Swal.fire({ title: 'Getting location…', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        setFilterByLocation(true);
        Swal.fire({ icon: 'success', title: 'Location found!', timer: 1500, showConfirmButton: false });
      },
      (err) => Swal.fire({ icon: 'error', title: 'Location error', text: err.message }),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const flatCategories = [];
  categories.forEach(c => {
    flatCategories.push({ ...c, parent: true });
    (c.children || []).forEach(ch => flatCategories.push({ ...ch, parent: false }));
  });
  const leafCategories = flatCategories.filter(c => !c.parent);

  const activeFiltersCount = selectedCategories.length + selectedServiceTypes.length + (filterByLocation ? 1 : 0);

  const handleToggleFavorite = (serviceId) => {
    const isFav = favoriteIds.includes(serviceId);
    const api = isFav ? favoritesApi.remove(serviceId) : favoritesApi.add(serviceId);
    api.then(({ data: d }) => setFavoriteIds(d.favoriteIds || [])).catch(() => {});
  };

  const Sidebar = () => (
    <div className="space-y-3">
      {/* Location filter */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <button type="button" onClick={handleLocation}
          className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-colors ${
            filterByLocation ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 hover:bg-slate-50'
          }`}>
          <Navigation size={16} className={filterByLocation ? 'text-emerald-600' : 'text-slate-400'} />
          {filterByLocation ? 'Filtering by location' : 'Near me'}
          {filterByLocation && <CheckCircle2 size={14} className="ml-auto text-emerald-500" />}
        </button>
        {filterByLocation && userLocation.lat && (
          <div className="px-4 pb-4 pt-1 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">Within {radius} km</span>
            </div>
            <input type="range" min="5" max="100" step="5" value={radius}
              onChange={e => setRadius(parseInt(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 cursor-pointer" />
            <div className="flex justify-between text-[10px] text-slate-400"><span>5 km</span><span>100 km</span></div>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <button type="button" onClick={() => setCatExpanded(!catExpanded)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
          <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Categories
            {selectedCategories.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
          </span>
          {catExpanded ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </button>
        {catExpanded && (
          <div className="px-3 pb-3 max-h-64 overflow-y-auto space-y-0.5">
            {leafCategories.map(c => {
              const checked = selectedCategories.includes(c.id);
              return (
                <label key={c.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${checked ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleCategory(c.id)} />
                  <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                  }`}>
                    {checked && <span className="text-white text-[10px] font-black">✓</span>}
                  </div>
                  <span className={`text-sm ${checked ? 'font-semibold text-emerald-700' : 'text-slate-600'}`}>{c.name}</span>
                </label>
              );
            })}
            {selectedCategories.length > 0 && (
              <button type="button" onClick={() => { setSelectedCategories([]); updateQuery('categories', null); }}
                className="w-full mt-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Service type */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <button type="button" onClick={() => setTypeExpanded(!typeExpanded)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
          <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Service Type
            {selectedServiceTypes.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                {selectedServiceTypes.length}
              </span>
            )}
          </span>
          {typeExpanded ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </button>
        {typeExpanded && (
          <div className="px-3 pb-3 space-y-0.5">
            {SERVICE_TYPES.map(({ value, label, icon }) => {
              const checked = selectedServiceTypes.includes(value);
              return (
                <label key={value}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${checked ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleType(value)} />
                  <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                  }`}>
                    {checked && <span className="text-white text-[10px] font-black">✓</span>}
                  </div>
                  <span className="text-base">{icon}</span>
                  <span className={`text-sm ${checked ? 'font-semibold text-emerald-700' : 'text-slate-600'}`}>{label}</span>
                </label>
              );
            })}
            {selectedServiceTypes.length > 0 && (
              <button type="button" onClick={() => { setSelectedServiceTypes([]); updateQuery('types', null); }}
                className="w-full mt-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" style={{ paddingTop: '80px', fontFamily: '"Inter", -apple-system, sans-serif' }}>

      {/* ── HERO ──────────────────────────────────────── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#059669 0%,#0D9488 60%,#0891B2 100%)', paddingBottom: '3rem', paddingTop: '3.5rem' }}>
        {/* BG blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle,#fff,transparent)', transform: 'translate(20%,-40%)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none opacity-5"
          style={{ background: 'radial-gradient(circle,#fff,transparent)', transform: 'translate(-30%,40%)' }} />

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 leading-tight">
              Find your perfect service
            </h1>
            <p className="text-emerald-100 text-lg max-w-xl mx-auto">
              Browse verified providers. Book at your location, theirs, or online.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-0 flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                <Search size={20} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search services, categories, providers…"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && updateQuery('q', q || null)}
                  className="flex-1 text-slate-800 text-base placeholder-slate-400 outline-none bg-transparent min-w-0"
                />
                {q && (
                  <button type="button" onClick={() => { setQ(''); updateQuery('q', null); }}
                    className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); updateQuery('sort', e.target.value); }}
                className="px-4 py-3.5 bg-white rounded-2xl text-sm font-semibold text-slate-700 cursor-pointer outline-none"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Location filter */}
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <button type="button" onClick={handleLocation}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filterByLocation
                    ? 'bg-white text-emerald-700 shadow-md'
                    : 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
                }`}>
                <Navigation size={14} />
                {filterByLocation ? `📍 Within ${radius} km` : 'Filter by my location'}
              </button>
              {filterByLocation && userLocation.lat && (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <input type="range" min="5" max="100" step="5" value={radius}
                    onChange={e => setRadius(parseInt(e.target.value))}
                    className="w-24 accent-white cursor-pointer" />
                  <button type="button" onClick={() => { setFilterByLocation(false); setUserLocation({ lat: null, lng: null }); }}
                    className="text-white/70 hover:text-white text-xs font-bold transition-colors">
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        <div className="flex gap-7">

          {/* Sidebar – desktop */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-3">
              <Sidebar />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-slate-700">
                  {loading ? 'Loading…' : `${data.services?.length || 0} service${data.services?.length !== 1 ? 's' : ''}`}
                  {filterByLocation && userLocation.lat && (
                    <span className="text-emerald-600"> near you</span>
                  )}
                </h2>
                {/* Mobile filter button */}
                <button type="button" onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl transition-colors hover:bg-slate-50">
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* View toggle */}
              <div className="flex gap-1 bg-white border border-slate-100 p-1 rounded-xl" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <button type="button"
                  onClick={() => { setMapView(false); updateQuery('map', null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${!mapView ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <LayoutGrid size={14} /> Grid
                </button>
                <button type="button"
                  onClick={() => { setMapView(true); updateQuery('map', '1'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${mapView ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Map size={14} /> Map
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCategories.map(id => {
                  const cat = leafCategories.find(c => c.id === id);
                  return cat ? (
                    <span key={id} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                      {cat.name}
                      <button type="button" onClick={() => toggleCategory(id)}><X size={10} /></button>
                    </span>
                  ) : null;
                })}
                {selectedServiceTypes.map(t => {
                  const cfg = SERVICE_TYPES.find(x => x.value === t);
                  return (
                    <span key={t} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                      {cfg?.icon} {cfg?.label}
                      <button type="button" onClick={() => toggleType(t)}><X size={10} /></button>
                    </span>
                  );
                })}
                {filterByLocation && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                    📍 Within {radius} km
                    <button type="button" onClick={() => { setFilterByLocation(false); setUserLocation({ lat: null, lng: null }); }}><X size={10} /></button>
                  </span>
                )}
                <button type="button"
                  onClick={() => { setSelectedCategories([]); setSelectedServiceTypes([]); setFilterByLocation(false); setUserLocation({ lat: null, lng: null }); }}
                  className="px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-50 rounded-full border border-red-200 transition-colors">
                  Clear all
                </button>
              </div>
            )}

            {/* Content */}
            {mapView ? (
              <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 540, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <ServicesMap services={data.services} />
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
                <p className="text-sm text-slate-400">Finding services…</p>
              </div>
            ) : !data.services?.length ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-bold text-slate-700 mb-1.5">No services found</p>
                <p className="text-sm text-slate-400 max-w-xs">Try adjusting your filters or search term.</p>
                {activeFiltersCount > 0 && (
                  <button type="button"
                    onClick={() => { setSelectedCategories([]); setSelectedServiceTypes([]); setFilterByLocation(false); }}
                    className="mt-5 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {data.services.map(s => (
                  <ServiceCard
                    key={s.id}
                    s={s}
                    isFavorite={user?.role === 'taker' && favoriteIds.includes(s.id)}
                    onToggleFavorite={user?.role === 'taker' ? handleToggleFavorite : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-50 z-50 overflow-y-auto p-4 lg:hidden"
            style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Filters</h2>
              <button type="button" onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <Sidebar />
            <button type="button" onClick={() => setSidebarOpen(false)}
              className="w-full mt-4 py-3 text-sm font-bold text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}>
              Show {data.services?.length || 0} results
            </button>
          </div>
        </>
      )}
    </div>
  );
}
