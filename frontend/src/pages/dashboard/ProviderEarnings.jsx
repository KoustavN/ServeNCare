import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { provider as providerApi } from '../../api/client';

export default function ProviderEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providerApi.earnings()
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-8 h-8 border-[2.5px] border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-3" />
      <p className="text-[13px] text-slate-400">Loading earnings…</p>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-[13px] text-slate-400">Unable to load earnings data.</p>
    </div>
  );

  const total = parseFloat(data.total_earnings || 0);
  const pending = parseFloat(data.pending_earnings || 0);
  const completed = parseFloat(data.completed_earnings || 0);
  const tx = data.transactions || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Earnings</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Your wallet and transaction history.</p>
      </div>

      {/* Hero total */}
      <div className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)', boxShadow: '0 4px 24px rgba(5,150,105,0.25)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(20%, -40%)' }} />
        <p className="text-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-1">Total Lifetime Earnings</p>
        <p className="text-[38px] font-black text-white leading-none mb-1">₹{total.toLocaleString()}</p>
        <p className="text-emerald-200 text-[12px]">Across all completed jobs</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Pending Payout', value: `₹${pending.toLocaleString()}`, icon: TrendingUp, dot: '#F59E0B', bar: '#FEF3C7', text: '#92400E', desc: 'Awaiting settlement' },
          { label: 'Completed Payouts', value: `₹${completed.toLocaleString()}`, icon: CheckCircle, dot: '#3B82F6', bar: '#EFF6FF', text: '#1E40AF', desc: 'Successfully paid out' },
        ].map(({ label, value, icon: Icon, dot, bar, text, desc }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `3px solid ${dot}` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bar }}>
                <Icon size={16} style={{ color: dot }} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-700">{label}</p>
                <p className="text-[11px]" style={{ color: dot }}>{desc}</p>
              </div>
            </div>
            <p className="text-[24px] font-black text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-slate-800">Transaction History</h2>
          {tx.length > 0 && (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
              {tx.length} entries
            </span>
          )}
        </div>
        {tx.length ? (
          <div className="divide-y divide-slate-50">
            {tx.map((t, i) => {
              const isCredit = t.amount >= 0;
              return (
                <div key={t.id || i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isCredit ? '#ECFDF5' : '#FEF2F2' }}>
                    {isCredit
                      ? <ArrowUpRight size={15} style={{ color: '#059669' }} />
                      : <ArrowDownRight size={15} style={{ color: '#EF4444' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 capitalize">
                      {(t.type || 'Transaction').replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(t.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className={`text-[15px] font-black flex-shrink-0 ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isCredit ? '+' : ''}₹{Math.abs(Number(t.amount)).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Wallet size={20} className="text-slate-300" />
            </div>
            <p className="text-[14px] font-semibold text-slate-600 mb-1">No transactions yet</p>
            <p className="text-[12px] text-slate-400">Completed bookings will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
