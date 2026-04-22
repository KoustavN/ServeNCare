import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, X, AlertCircle, ShieldCheck, ArrowRight, Copy, Check } from 'lucide-react';
import { bookings as bookingsApi, reviews } from '../../api/client';

const STATUS_MAP = {
  pending:   { label: 'Pending',   dot: '#F59E0B', bar: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Confirmed', dot: '#3B82F6', bar: '#EFF6FF', text: '#1E40AF' },
  completed: { label: 'Completed', dot: '#10B981', bar: '#ECFDF5', text: '#065F46' },
  cancelled: { label: 'Cancelled', dot: '#EF4444', bar: '#FEF2F2', text: '#991B1B' },
};

const FILTERS = ['', 'pending', 'confirmed', 'completed', 'cancelled'];

function StatusPill({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, dot: '#94A3B8', bar: '#F8FAFC', text: '#475569' };
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

function OtpDisplay({ otp, isDone }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(otp).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div className="mt-4 rounded-2xl overflow-hidden" style={{ border: '1px solid #BFDBFE', background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)' }}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} style={{ color: '#2563EB' }} />
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#1D4ED8' }}>
              {isDone ? 'OTP Used' : 'Your Verification OTP'}
            </p>
          </div>
          {!isDone && (
            <button type="button" onClick={copy}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
              style={{ background: copied ? '#DCFCE7' : '#DBEAFE', color: copied ? '#166534' : '#1E40AF' }}>
              {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          {otp.split('').map((d, i) => (
            <div key={i} className="w-9 h-11 rounded-xl flex items-center justify-center text-[22px] font-black"
              style={{
                background: isDone ? '#DCFCE7' : 'white',
                color: isDone ? '#166534' : '#1E3A8A',
                border: isDone ? '1.5px solid #86EFAC' : '1.5px solid #93C5FD',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}>
              {d}
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: '#2563EB' }}>
          {isDone
            ? '✅ This OTP was used to verify the service was completed.'
            : '🔐 Show this to your provider only when the service is done. They will enter it to confirm completion.'}
        </p>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [data, setData] = useState({ bookings: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    bookingsApi.list({ status: filter || undefined })
      .then(({ data: res }) => {
        setData(res);
        // Mark bookings that already have a review (from API) so "Edit review" shows
        const fromApi = (res.bookings || []).filter(b => b.has_review).map(b => b.id);
        setReviewedIds(prev => new Set([...prev, ...fromApi]));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const handleCancel = (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    bookingsApi.cancel(id)
      .then(() => setData(d => ({ ...d, bookings: d.bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b) })))
      .catch(e => alert(e.response?.data?.error || 'Failed to cancel'));
  };

  const openReviewModal = (b) => { setReviewModal(b); setReviewRating(5); setReviewComment(''); };
  const closeReviewModal = () => setReviewModal(null);

  const submitReview = () => {
    if (!reviewModal || reviewSubmitting) return;
    setReviewSubmitting(true);
    reviews.create({ booking_id: reviewModal.id, rating: reviewRating, comment: reviewComment.trim() || undefined })
      .then(() => { setReviewedIds(s => new Set(s).add(reviewModal.id)); closeReviewModal(); })
      .catch(e => alert(e.response?.data?.error || 'Failed to submit review'))
      .finally(() => setReviewSubmitting(false));
  };

  const handleAcceptCounter = (b) => {
    bookingsApi.acceptCounter(b.id)
      .then(() => setData(d => ({ ...d, bookings: d.bookings.map(x => x.id === b.id ? { ...x, status: 'confirmed', amount: b.counter_offer_amount, counter_offer_amount: null, counter_offer_message: null } : x) })))
      .catch(e => alert(e.response?.data?.error || 'Failed'));
  };
  const handleDeclineCounter = (b) => {
    bookingsApi.rejectCounter(b.id)
      .then(() => setData(d => ({ ...d, bookings: d.bookings.map(x => x.id === b.id ? { ...x, counter_offer_amount: null, counter_offer_message: null } : x) })))
      .catch(e => alert(e.response?.data?.error || 'Failed'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-sm text-slate-400 mt-1">Track and manage all your service bookings.</p>
        </div>
        <Link to="/services"
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 2px 6px rgba(5,150,105,0.25)' }}>
          + Book a Service
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {FILTERS.map(s => (
          <button key={s || 'all'} type="button" onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              filter === s
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}>
            {s ? STATUS_MAP[s]?.label || s : 'All'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 border-[2.5px] border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-3" />
          <p className="text-[13px] text-slate-400">Loading bookings…</p>
        </div>
      ) : !data.bookings?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
            <Calendar size={26} className="text-slate-300" />
          </div>
          <p className="text-[15px] font-bold text-slate-700 mb-1">No bookings yet</p>
          <p className="text-[13px] text-slate-400 mb-5">Browse services and make your first booking.</p>
          <Link to="/services"
            className="flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-bold text-white rounded-xl"
            style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}>
            Browse Services <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.bookings.map(b => {
            const canCancel = ['pending', 'confirmed'].includes(b.status);
            const cfg = STATUS_MAP[b.status] || STATUS_MAP.pending;
            return (
              <div key={b.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all duration-200 hover:shadow-md"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', borderLeft: `3px solid ${cfg.dot}` }}>

                <div className="p-5">
                  {/* Top row */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-white text-base"
                      style={{ background: `linear-gradient(135deg, ${cfg.dot}CC, ${cfg.dot})` }}>
                      {b.service_title?.charAt(0) || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <h3 className="text-base font-bold text-slate-900 truncate">{b.service_title}</h3>
                        <StatusPill status={b.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1">
                        <span className="text-sm font-semibold text-slate-600">{b.provider_name}</span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Calendar size={13} /> {formatDate(b.scheduled_at)}
                        </span>
                        {b.taker_address && (
                          <span className="flex items-center gap-1.5 text-sm text-slate-400">
                            <MapPin size={13} /> <span className="truncate max-w-[200px]">{b.taker_address}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-black text-slate-900">₹{Number(b.amount).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Counter offer */}
                  {b.status === 'pending' && b.counter_offer_amount != null && (
                    <div className="mt-4 p-4 rounded-2xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#B45309' }}>
                        Provider sent a counter offer
                      </p>
                      <p className="text-[22px] font-black mb-1" style={{ color: '#78350F' }}>
                        ₹{Number(b.counter_offer_amount).toLocaleString()}
                      </p>
                      {b.counter_offer_message && (
                        <p className="text-[12px] mb-3" style={{ color: '#92400E' }}>{b.counter_offer_message}</p>
                      )}
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleAcceptCounter(b)}
                          className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-white rounded-xl transition-all"
                          style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 2px 6px rgba(5,150,105,0.25)' }}>
                          Accept offer
                        </button>
                        <button type="button" onClick={() => handleDeclineCounter(b)}
                          className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-xl transition-colors"
                          style={{ color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OTP – only show while confirmed (need to share with provider). Hide once completed. */}
                  {b.status === 'confirmed' && b.completion_otp && (
                    <OtpDisplay otp={b.completion_otp} isDone={false} />
                  )}
                </div>

                {/* Actions footer */}
                {(canCancel || b.status === 'completed') && (
                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap gap-2">
                    {canCancel && (
                      <button type="button" onClick={() => handleCancel(b.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-colors"
                        style={{ color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                        <X size={14} /> Cancel booking
                      </button>
                    )}
                    {b.status === 'completed' && (
                      <button type="button" onClick={() => openReviewModal(b)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all"
                        style={{ color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                        <Star size={14} /> {reviewedIds.has(b.id) ? 'Edit review' : 'Leave a review'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── REVIEW MODAL ───────────────────────────── */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={closeReviewModal}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>

            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[16px] font-black text-slate-900">
                    {reviewedIds.has(reviewModal.id) ? 'Edit your review' : 'Leave a Review'}
                  </h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">{reviewModal.service_title}</p>
                </div>
                <button type="button" onClick={closeReviewModal}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              {/* Stars */}
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Your rating</p>
              <div className="flex items-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} type="button" onClick={() => setReviewRating(i)}
                    className="transition-transform hover:scale-110 active:scale-95">
                    <Star size={30}
                      fill={i <= reviewRating ? '#F59E0B' : 'none'}
                      color={i <= reviewRating ? '#F59E0B' : '#D1D5DB'}
                      strokeWidth={1.5} />
                  </button>
                ))}
                <span className="text-[13px] font-black text-slate-500 ml-1">{reviewRating}<span className="font-normal">/5</span></span>
              </div>

              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Your experience</p>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="What did you like? What could be improved?"
                rows={3}
                className="w-full text-[13px] border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-amber-400 resize-none mb-5 transition-colors"
                style={{ '--tw-ring-color': 'rgba(245,158,11,0.25)' }}
              />

              <div className="flex gap-3">
                <button type="button" onClick={closeReviewModal}
                  className="flex-1 py-3 text-[13px] font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={submitReview} disabled={reviewSubmitting}
                  className="flex-1 py-3 text-[13px] font-bold text-white rounded-xl transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 2px 8px rgba(217,119,6,0.3)' }}>
                  {reviewSubmitting ? 'Saving…' : (reviewedIds.has(reviewModal?.id) ? 'Update review' : 'Submit review')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
