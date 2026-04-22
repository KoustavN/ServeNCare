import React, { useState, useEffect } from 'react';
import {
  Calendar, MapPin, User, MessageSquare, Send, Clock, X,
  CheckCircle, XCircle, KeyRound, AlertCircle, Copy, Check,
} from 'lucide-react';
import { bookings as bookingsApi } from '../../api/client';

const STATUS = {
  pending:    { label: 'Pending',     dot: '#F59E0B', bar: '#FEF3C7', text: '#92400E' },
  confirmed:  { label: 'Confirmed',   dot: '#3B82F6', bar: '#EFF6FF', text: '#1E40AF' },
  in_progress:{ label: 'In progress', dot: '#6366F1', bar: '#EEF2FF', text: '#3730A3' },
  completed:  { label: 'Completed',   dot: '#10B981', bar: '#ECFDF5', text: '#065F46' },
  cancelled:  { label: 'Cancelled',   dot: '#EF4444', bar: '#FEF2F2', text: '#991B1B' },
  no_show:    { label: 'No show',     dot: '#94A3B8', bar: '#F8FAFC', text: '#475569' },
};

const FILTERS = ['', 'pending', 'confirmed', 'completed', 'cancelled'];

function StatusPill({ status }) {
  const cfg = STATUS[status] || { label: status, dot: '#94A3B8', text: '#475569', bar: '#F8FAFC' };
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bar, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function formatDate(s) {
  return new Date(s).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function ProviderBookings() {
  const [data, setData] = useState({ bookings: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [counterOfferId, setCounterOfferId] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [counterSubmitting, setCounterSubmitting] = useState(false);
  const [completeBookingId, setCompleteBookingId] = useState(null);
  const [completeOtp, setCompleteOtp] = useState('');
  const [completeSubmitting, setCompleteSubmitting] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  useEffect(() => {
    setLoading(true);
    bookingsApi.list({ status: filter || undefined })
      .then(({ data: res }) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const confirm = (id) => {
    bookingsApi.confirm(id)
      .then(() => setData(d => ({ ...d, bookings: d.bookings.map(b => b.id === id ? { ...b, status: 'confirmed' } : b) })))
      .catch(e => alert(e.response?.data?.error || 'Failed'));
  };
  const reject = (id) => {
    if (!window.confirm('Decline this booking?')) return;
    bookingsApi.reject(id)
      .then(() => setData(d => ({ ...d, bookings: d.bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b) })))
      .catch(e => alert(e.response?.data?.error || 'Failed'));
  };

  const openCompleteModal = (b) => { setCompleteBookingId(b.id); setCompleteOtp(''); setCompleteError(null); };
  const closeCompleteModal = () => { setCompleteBookingId(null); setCompleteOtp(''); setCompleteError(null); };

  const markDoneInState = (bookingId) => {
    setData(d => ({ ...d, bookings: d.bookings.map(b => b?.id === bookingId ? { ...b, status: 'completed' } : b) }));
    closeCompleteModal();
  };

  const submitComplete = () => {
    if (!completeBookingId || !completeOtp.trim()) return;
    setCompleteError(null);
    setCompleteSubmitting(true);
    const id = completeBookingId;
    bookingsApi.complete(id, { otp: completeOtp.trim() })
      .then(() => markDoneInState(id))
      .catch(e => {
        const msg = e.response?.data?.error || 'Invalid OTP. Ask the customer for the verification OTP.';
        if (msg.includes('Current status: completed')) { markDoneInState(id); return; }
        setCompleteError(msg);
      })
      .finally(() => setCompleteSubmitting(false));
  };

  const openCounterOffer = (b) => { setCounterOfferId(b.id); setCounterAmount(String(b.counter_offer_amount ?? b.amount)); setCounterMessage(b.counter_offer_message || ''); };
  const closeCounterOffer = () => { setCounterOfferId(null); setCounterAmount(''); setCounterMessage(''); };
  const submitCounterOffer = () => {
    if (!counterOfferId || !counterAmount || parseFloat(counterAmount) < 0) return;
    const amount = parseFloat(counterAmount);
    const message = counterMessage.trim() || null;
    setCounterSubmitting(true);
    const id = counterOfferId;
    bookingsApi.counterOffer(id, { amount, message: message || undefined })
      .then(() => {
        setData(d => ({ ...d, bookings: (d.bookings || []).map(b => b?.id === id ? { ...b, counter_offer_amount: amount, counter_offer_message: message } : b) }));
        closeCounterOffer();
      })
      .catch(e => alert(e.response?.data?.error || 'Failed'))
      .finally(() => setCounterSubmitting(false));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage incoming requests and upcoming jobs.</p>
        </div>
        {data.bookings?.length > 0 && (
          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 rounded-xl">
            <span className="text-sm font-bold text-white">{data.total || data.bookings.length}</span>
            <span className="text-sm text-slate-400">bookings</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {FILTERS.map(s => (
          <button key={s || 'all'} type="button"
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              filter === s
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}>
            {s ? STATUS[s]?.label || s : 'All'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-9 h-9 border-[3px] border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-400">Loading bookings…</p>
        </div>
      ) : !data.bookings?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
            <Calendar size={32} className="text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-700 mb-1.5">No bookings found</p>
          <p className="text-sm text-slate-400 max-w-xs">
            {filter ? `No ${STATUS[filter]?.label.toLowerCase()} bookings.` : "When customers book your services, they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data.bookings || []).filter(Boolean).map(b => {
            const isCounterOpen = counterOfferId === b.id;
            const cfg = STATUS[b.status] || STATUS.pending;

            return (
              <div key={b.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all duration-200 hover:shadow-md"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', borderLeft: `3px solid ${cfg.dot}` }}>

                <div className="p-6">
                  {/* Top row */}
                  <div className="flex items-start gap-4">
                    {/* Service icon */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-white text-base"
                      style={{ background: `linear-gradient(135deg, ${cfg.dot}CC, ${cfg.dot})` }}>
                      {b.service_title?.charAt(0) || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <h3 className="text-base font-bold text-slate-900 truncate">{b.service_title}</h3>
                        <StatusPill status={b.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <User size={13} className="text-slate-400" />
                          <span className="font-medium text-slate-600">{b.taker_name}</span>
                          {b.taker_phone && <span className="text-slate-400">· {b.taker_phone}</span>}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Calendar size={13} className="text-slate-400" />
                          {formatDate(b.scheduled_at)}
                        </span>
                        {b.taker_address && (
                          <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin size={13} className="text-slate-400" />
                            <span className="truncate max-w-[220px]">{b.taker_address}</span>
                          </span>
                        )}
                      </div>
                      {b.notes && (
                        <p className="text-sm text-slate-400 mt-2.5 italic bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                          "{b.notes}"
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-black text-slate-900">₹{Number(b.amount).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Counter offer sent */}
                  {b.status === 'pending' && b.counter_offer_amount != null && !isCounterOpen && (
                    <div className="mt-4 flex items-center gap-3 p-3.5 rounded-xl"
                      style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: '#FEF3C7' }}>
                        <Send size={13} style={{ color: '#D97706' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold" style={{ color: '#92400E' }}>
                          Counter offer sent · <span>₹{Number(b.counter_offer_amount).toLocaleString()}</span>
                        </p>
                        {b.counter_offer_message && (
                          <p className="text-[11px] truncate mt-0.5" style={{ color: '#B45309' }}>{b.counter_offer_message}</p>
                        )}
                        <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: '#D97706' }}>
                          <Clock size={9} /> Awaiting customer response
                        </p>
                      </div>
                      <button type="button" onClick={() => openCounterOffer(b)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                        style={{ color: '#B45309', background: '#FEF3C7' }}>
                        Edit
                      </button>
                    </div>
                  )}

                  {/* Counter offer form */}
                  {b.status === 'pending' && isCounterOpen && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <p className="text-[12px] font-bold text-slate-700">Send Counter Offer</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Amount (₹)</label>
                          <input type="number" min="0" step="0.01" value={counterAmount}
                            onChange={e => setCounterAmount(e.target.value)}
                            className="w-full text-[13px] font-semibold border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 bg-white transition-all" />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Message (optional)</label>
                          <input type="text" value={counterMessage} onChange={e => setCounterMessage(e.target.value)}
                            placeholder="e.g. Includes materials…"
                            className="w-full text-[13px] border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 bg-white transition-all" />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <button type="button" onClick={closeCounterOffer}
                          className="px-4 py-2 text-[12px] font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors">
                          Cancel
                        </button>
                        <button type="button" onClick={submitCounterOffer} disabled={counterSubmitting}
                          className="px-4 py-2 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-60">
                          {counterSubmitting ? 'Sending…' : 'Send offer'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action footer */}
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button type="button" onClick={() => confirm(b.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl transition-all"
                          style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 2px 6px rgba(5,150,105,0.25)' }}>
                          <CheckCircle size={15} /> Accept
                        </button>
                        {b.counter_offer_amount == null && (
                          <button type="button" onClick={() => isCounterOpen ? closeCounterOffer() : openCounterOffer(b)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
                            <MessageSquare size={15} /> {isCounterOpen ? 'Cancel' : 'Counter offer'}
                          </button>
                        )}
                        <button type="button" onClick={() => reject(b.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-colors"
                          style={{ color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                          <XCircle size={15} /> Decline
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button type="button" onClick={() => openCompleteModal(b)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl transition-all"
                        style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}>
                        <KeyRound size={15} /> Enter OTP to complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── OTP MODAL ──────────────────────────────── */}
      {completeBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={closeCompleteModal}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="px-6 pt-6 pb-5 text-center border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
                <KeyRound size={20} className="text-white" />
              </div>
              <h3 className="text-[16px] font-black text-slate-900">Enter Customer OTP</h3>
              <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                Ask the customer for their <strong className="text-slate-600">6-digit OTP</strong> from their My Bookings page
              </p>
            </div>

            <div className="px-6 py-5">
              {completeError && (
                <div className="flex items-start gap-2 p-3 rounded-xl mb-4"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <AlertCircle size={14} style={{ color: '#EF4444' }} className="mt-0.5 flex-shrink-0" />
                  <p className="text-[12px]" style={{ color: '#DC2626' }}>{completeError}</p>
                </div>
              )}

              {/* OTP input */}
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={completeOtp}
                onChange={e => setCompleteOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-[32px] font-black tracking-[0.5em] border-2 rounded-2xl px-4 py-4 mb-5 transition-all focus:outline-none"
                style={{
                  borderColor: completeOtp.length === 6 ? '#2563EB' : '#E2E8F0',
                  boxShadow: completeOtp.length === 6 ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
                  letterSpacing: '0.5em',
                }}
              />

              <div className="flex gap-3">
                <button type="button" onClick={closeCompleteModal}
                  className="flex-1 py-3 text-[13px] font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={submitComplete}
                  disabled={completeSubmitting || completeOtp.length !== 6}
                  className="flex-1 py-3 text-[13px] font-bold text-white rounded-xl transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
                  {completeSubmitting ? 'Verifying…' : 'Verify & Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
