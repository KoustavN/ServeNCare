import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Trash2 } from 'lucide-react';
import { favorites as favoritesApi } from '../../api/client';

export default function FavoritesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => {
    setLoading(true);
    favoritesApi.list()
      .then(({ data }) => setList(data.favorites || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleRemove = (e, serviceId) => {
    e.preventDefault();
    e.stopPropagation();
    favoritesApi.remove(serviceId).then(() => fetchFavorites()).catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-500">Loading favorites…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved services</h1>
        <p className="text-sm text-slate-500 mt-0.5">Services you've saved for later.</p>
      </div>

      {!list.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-700">No saved services</p>
          <p className="text-sm text-slate-500 mt-1">When you save a service from the listing or detail page, it will appear here.</p>
          <Link to="/services" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-sky-500 hover:bg-sky-600">
            Browse services
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((s) => (
            <Link key={s.id} to={`/services/${s.id}`}
              className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
              <div className="relative h-40 bg-slate-100 flex-shrink-0">
                {s.images?.[0] ? (
                  <img src={s.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100">
                    <span className="text-4xl">{s.category_name?.[0] || '✦'}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, s.id)}
                  className="absolute top-2 right-2 w-9 h-9 rounded-xl bg-white/90 hover:bg-rose-50 flex items-center justify-center text-rose-500 hover:text-rose-600 shadow-sm"
                  title="Remove from saved"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">{s.category_name}</p>
                <h3 className="font-bold text-slate-900 mt-1 line-clamp-2">{s.title}</h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  {s.avg_rating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star size={12} fill="#F59E0B" className="text-amber-500" />
                      {Number(s.avg_rating).toFixed(1)}
                    </span>
                  )}
                  <span className="text-emerald-600 font-semibold">₹{Number(s.price).toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
