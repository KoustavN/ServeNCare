import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Pencil, Trash2, MapPin, ChevronLeft, ChevronRight, Tag, Clock, Star, ShieldAlert } from 'lucide-react';
import { provider as providerApi, services as servicesApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function ProviderServices() {
  const { user } = useAuth();
  const [data, setData] = useState({ services: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const isVerified = !!user?.is_verified;

  const handleAddService = () => {
    if (!isVerified) {
      Swal.fire({
        title: 'Verification required',
        text: 'Your account must be verified by an admin before you can post new services. Please wait for verification or contact support.',
        icon: 'info',
        confirmButtonColor: '#059669',
      });
      return;
    }
    navigate('/dashboard/provider/services/new');
  };

  const fetchMyServices = (page = 1) => {
    setLoading(true);
    providerApi.services({ page, limit: 10 })
      .then(({ data: d }) => { setData(d); setCurrentPage(d.page || page); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMyServices(1); }, []);

  const goToPage = (page) => {
    if (page < 1 || page > data.totalPages) return;
    fetchMyServices(page);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete service?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Delete',
    });
    if (!result.isConfirmed) return;
    servicesApi.remove(id)
      .then(() => {
        Swal.fire({ title: 'Deleted', icon: 'success', timer: 1200, showConfirmButton: false });
        fetchMyServices(currentPage);
      })
      .catch(e => Swal.fire('Error', e.response?.data?.error || 'Failed to delete', 'error'));
  };

  const getRecurringLabel = (type, freq) => {
    if (!type || type === 'one_time') return 'One-time';
    const labels = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };
    return `${labels[type] || type}${freq > 1 ? ` (${freq}×)` : ''}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {!isVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} className="text-amber-600" />
          </div>
          <p className="text-sm text-amber-800">You can only add new services after an admin verifies your account.</p>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">My Services</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Add and manage your service listings.</p>
        </div>
        <button
          type="button"
          onClick={handleAddService}
          disabled={!isVerified}
          className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all ${isVerified ? 'text-white' : 'text-slate-400 bg-slate-200 cursor-not-allowed'}`}
          style={isVerified ? { background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' } : {}}
        >
          <Plus size={15} /> Add Service
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 border-[2.5px] border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-3" />
          <p className="text-[13px] text-slate-400">Loading services…</p>
        </div>
      ) : !data.services.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
            <Briefcase size={26} className="text-slate-300" />
          </div>
          <p className="text-[15px] font-bold text-slate-700 mb-1">No services yet</p>
          <p className="text-[13px] text-slate-400 mb-5 max-w-xs">Add your first service listing to start receiving booking requests.</p>
          <button type="button" onClick={handleAddService}
            disabled={!isVerified}
            className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold rounded-xl ${isVerified ? 'text-white' : 'text-slate-400 bg-slate-200 cursor-not-allowed'}`}
            style={isVerified ? { background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' } : {}}
          >
            <Plus size={14} /> Add First Service
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.services.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md group"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="flex items-start gap-4 p-4">
                  {/* Thumbnail */}
                  {s.images?.[0] ? (
                    <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                      <img src={s.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xl"
                      style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', color: '#059669' }}>
                      {s.title?.charAt(0) || '?'}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-bold text-slate-900 mb-1">{s.title}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {s.category_name && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                              <Tag size={9} /> {s.category_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock size={9} /> {getRecurringLabel(s.recurring_type, s.frequency)}
                          </span>
                          {s.avg_rating > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] font-bold" style={{ color: '#D97706' }}>
                              <Star size={9} fill="#F59E0B" color="#F59E0B" /> {Number(s.avg_rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        {s.address && (
                          <p className="flex items-center gap-1 text-[11px] text-slate-400">
                            <MapPin size={9} /> {s.address}
                          </p>
                        )}
                        {s.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-relaxed">{s.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[18px] font-black text-slate-900">
                          ₹{Number(s.price).toLocaleString()}
                          {s.price_type === 'hourly' && <span className="text-[11px] font-semibold text-slate-400">/hr</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize">{s.service_type?.replace('_', ' ') || ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button type="button" onClick={() => navigate(`/dashboard/provider/services/edit/${s.id}`)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: '#EFF6FF', color: '#2563EB' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                      onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}
                      aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => handleDelete(s.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: '#FEF2F2', color: '#EF4444' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                      onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                      aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-[12px] font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white">
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} type="button" onClick={() => goToPage(p)}
                  className={`w-9 h-9 text-[12px] font-bold rounded-xl transition-all ${
                    p === currentPage
                      ? 'text-white shadow-sm'
                      : 'text-slate-600 border border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                  style={p === currentPage ? { background: 'linear-gradient(135deg, #059669, #10B981)' } : {}}>
                  {p}
                </button>
              ))}
              <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === data.totalPages}
                className="flex items-center gap-1 px-3 py-2 text-[12px] font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white">
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
