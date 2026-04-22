import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserCheck, Shield, Mail, Phone, Building2, MapPin, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { admin as adminApi } from '../../api/client';
import Swal from 'sweetalert2';

export default function AdminProviders() {
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(() => searchParams.get('verified') === 'false' ? 'pending' : 'all');
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchProviders = () => {
    setLoading(true);
    const params = filter === 'pending' ? { verified: 'false' } : filter === 'verified' ? { verified: 'true' } : {};
    adminApi.providers(params)
      .then(({ data }) => setProviders(data.providers || []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProviders(); }, [filter]);

  const handleVerify = (id, name) => {
    setVerifyingId(id);
    adminApi.verifyProvider(id)
      .then(() => {
        Swal.fire({ icon: 'success', title: 'Verified', text: `${name || 'Provider'} can now post services.`, timer: 2000, showConfirmButton: false });
        fetchProviders();
      })
      .catch((err) => Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Failed to verify.' }))
      .finally(() => setVerifyingId(null));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Providers</h1>
          <p className="text-sm text-slate-500 mt-0.5">Verify new providers so they can post services.</p>
        </div>
        <button
          type="button"
          onClick={() => fetchProviders()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1.5 bg-white rounded-xl border border-slate-100 shadow-sm w-fit">
        {[
          { id: 'pending', label: 'Pending verification', icon: AlertCircle },
          { id: 'verified', label: 'Verified', icon: CheckCircle },
          { id: 'all', label: 'All', icon: UserCheck },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              filter === id ? 'bg-violet-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-violet-500 rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading providers…</p>
        </div>
      ) : !providers.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <UserCheck size={28} className="text-slate-400" />
          </div>
          <p className="text-base font-bold text-slate-700">
            {filter === 'pending' ? 'No providers pending verification' : filter === 'verified' ? 'No verified providers' : 'No providers yet'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {filter === 'pending' ? 'New provider registrations will appear here for verification.' : 'Providers will appear here after registration.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${p.is_verified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {p.is_verified ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{p.full_name || '—'}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {p.email}
                      </span>
                      {p.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {p.phone}
                        </span>
                      )}
                    </div>
                    {(p.business_name || p.address) && (
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                        {p.business_name && (
                          <span className="flex items-center gap-1">
                            <Building2 size={11} /> {p.business_name}
                          </span>
                        )}
                        {p.address && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {p.address}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-semibold">
                      <Shield size={14} /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleVerify(p.id, p.full_name)}
                      disabled={verifyingId === p.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl disabled:opacity-60 transition-colors"
                    >
                      {verifyingId === p.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      {verifyingId === p.id ? 'Verifying…' : 'Verify'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
