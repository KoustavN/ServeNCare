import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ExternalLink, MapPin, Star, Briefcase } from 'lucide-react';
import { admin } from '../../api/client';

const STATUS_COLORS = {
  active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-50 text-slate-600 border-slate-200',
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
};

export default function AdminServices() {
  const [data, setData] = useState({ services: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  function fetchServices(page = 1) {
    setLoading(true);
    const params = { page, limit: 15 };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    admin.services(params)
      .then(({ data: res }) => {
        setData({ services: res.services || [], total: res.total || 0, page: res.page || 1, totalPages: res.totalPages || 1 });
        setCurrentPage(res.page || 1);
      })
      .catch(() => setData({ services: [], total: 0, page: 1, totalPages: 1 }))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchServices(1); }, [statusFilter]);

  const handleSearch = (e) => { e.preventDefault(); fetchServices(1); };
  const goToPage = (p) => { if (p < 1 || p > data.totalPages) return; fetchServices(p); };

  const getRecurringLabel = (type, freq) => {
    if (!type || type === 'one_time') return 'One-time';
    return `${type.charAt(0).toUpperCase() + type.slice(1)} (${freq || 1}x)`;
  };

  const pages = Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
    if (data.totalPages <= 7) return i + 1;
    if (currentPage <= 4) return i + 1;
    if (currentPage >= data.totalPages - 3) return data.totalPages - 6 + i;
    return currentPage - 3 + i;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">All Services</h1>
        <p className="text-slate-500 text-sm mt-1">View and manage all service listings on the platform.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search services…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-colors" />
          </div>
          <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
            Search
          </button>
        </form>
        <div className="flex gap-2">
          {['', 'active', 'inactive', 'pending'].map(s => (
            <button key={s || 'all'} type="button" onClick={() => setStatusFilter(s)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize ${statusFilter === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading services…</p>
        </div>
      ) : !data.services.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Briefcase size={28} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-700 mb-1">No services found</h3>
          <p className="text-sm text-slate-400">No services match your current filters.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 font-medium">Showing {data.services.length} of {data.total} services</p>

          <div className="space-y-3">
            {data.services.map(s => (
              <div key={s.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 p-4">
                  {s.images?.[0] ? (
                    <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                      <img src={s.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-14 rounded-xl flex-shrink-0 bg-emerald-50 flex items-center justify-center">
                      <Briefcase size={18} className="text-emerald-500" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <h3 className="font-bold text-slate-800 text-sm">{s.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[s.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {s.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500 mb-2">
                      <span><span className="font-medium text-slate-600">Provider:</span> {s.provider_name}</span>
                      <span><span className="font-medium text-slate-600">Category:</span> {s.category_name}</span>
                      <span><span className="font-medium text-slate-600">Type:</span> {s.service_type?.replace('_', ' ')}</span>
                      <span><span className="font-medium text-slate-600">Schedule:</span> {getRecurringLabel(s.recurring_type, s.frequency)}</span>
                      <span>
                        <span className="font-medium text-slate-600">Price:</span> ₹{Number(s.price).toLocaleString()}{s.price_type === 'hourly' ? '/hr' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={11} fill="#fbbf24" color="#fbbf24" />
                        {s.avg_rating ? `${Number(s.avg_rating).toFixed(1)} (${s.review_count})` : 'No reviews'}
                      </span>
                    </div>

                    {s.description && <p className="text-xs text-slate-400 line-clamp-1 mb-2">{s.description}</p>}

                    <div className="flex items-center gap-4 flex-wrap">
                      {s.latitude && s.longitude && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={11} />
                          {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                          {s.radius_km > 0 && ` (${s.radius_km}km)`}
                        </span>
                      )}
                      {s.latitude && s.longitude && (
                        <a href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                          <ExternalLink size={11} /> View on map
                        </a>
                      )}
                      <span className="text-xs text-slate-300">Created {new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} /> Prev
              </button>
              {pages.map(p => (
                <button key={p} type="button" onClick={() => goToPage(p)}
                  className={`w-9 h-9 text-sm font-semibold rounded-xl transition-colors ${p === currentPage ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                  {p}
                </button>
              ))}
              <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === data.totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
