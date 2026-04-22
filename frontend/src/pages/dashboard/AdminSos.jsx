import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Clock, User, CheckCircle, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { admin as adminApi } from '../../api/client';

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function AdminSos() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSos = () => {
    setLoading(true);
    const params = statusFilter === 'all' ? {} : { status: statusFilter };
    adminApi.sosList(params)
      .then(({ data }) => setIncidents(data.incidents || []))
      .catch(() => setIncidents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSos();
  }, [statusFilter]);

  const handleAssign = async (id) => {
    setUpdatingId(id);
    try {
      await adminApi.sosAssign(id);
      fetchSos();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResolve = async (id) => {
    setUpdatingId(id);
    try {
      await adminApi.sosResolve(id);
      fetchSos();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <Link to="/dashboard/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back to overview
      </Link>

      <div className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-amber-50 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <AlertTriangle size={22} className="text-rose-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">SOS alerts</h1>
            <p className="text-xs text-slate-600">
              Live safety alerts triggered by women providers. Coordinate with them and mark incidents as resolved.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
          {[
            { id: 'open', label: 'Open' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'all', label: 'All' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatusFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusFilter === t.id ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={fetchSos}
          disabled={loading}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-rose-500 rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading SOS incidents…</p>
        </div>
      ) : !incidents.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Shield size={26} className="text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-700">No SOS incidents in this view</p>
          <p className="text-xs text-slate-500 mt-1">You will see new alerts here as providers trigger SOS on jobs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((i) => {
            const isOpen = i.status === 'open';
            const isAssigned = i.status === 'assigned';
            const statusColor =
              i.status === 'open' ? 'text-rose-600 bg-rose-50' :
              i.status === 'assigned' ? 'text-amber-700 bg-amber-50' :
              'text-emerald-700 bg-emerald-50';
            return (
              <div
                key={i.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-rose-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        <User size={14} /> {i.provider_name || 'Provider'}
                      </p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                        {i.status === 'open' && 'Open'}
                        {i.status === 'assigned' && 'Assigned'}
                        {i.status === 'resolved' && 'Resolved'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {i.provider_email} {i.provider_phone ? `· ${i.provider_phone}` : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatTime(i.created_at)}
                      </span>
                      {i.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {i.location.lat?.toFixed(4)}, {i.location.lng?.toFixed(4)}
                        </span>
                      )}
                    </div>
                    {i.location && (
                      <div className="mt-1">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${i.location.lat},${i.location.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold"
                        >
                          Open in Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 justify-end">
                  {isOpen && (
                    <button
                      type="button"
                      disabled={updatingId === i.id}
                      onClick={() => handleAssign(i.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
                    >
                      <Shield size={12} /> Assign to me
                    </button>
                  )}
                  {(isOpen || isAssigned) && (
                    <button
                      type="button"
                      disabled={updatingId === i.id}
                      onClick={() => handleResolve(i.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                    >
                      <CheckCircle size={12} /> Mark resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

