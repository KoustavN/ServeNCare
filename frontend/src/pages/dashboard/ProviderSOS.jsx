import React, { useState } from 'react';
import { AlertTriangle, MapPin, ArrowLeft, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { provider as providerApi } from '../../api/client';

export default function ProviderSOS() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const gender = user?.provider_profile?.gender || user?.gender || '';
  const isFemale = gender === 'female';

  const handleSOS = async () => {
    if (!isFemale) return;

    const { isConfirmed } = await Swal.fire({
      title: 'Send SOS?',
      text: 'Use this only if you are in an emergency. Your current location will be sent to the admin team.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, send SOS',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#DC2626',
    });
    if (!isConfirmed) return;

    if (!navigator.geolocation) {
      Swal.fire({ icon: 'error', title: 'Location not supported', text: 'Your browser does not support geolocation.' });
      return;
    }

    setSending(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
        });
      });

      const { latitude, longitude, accuracy } = pos.coords;
      await providerApi.sos({
        lat: latitude,
        lng: longitude,
        accuracy,
      });

      await Swal.fire({
        icon: 'success',
        title: 'SOS sent',
        text: 'The admin team has been notified and will coordinate with you.',
        confirmButtonColor: '#059669',
      });
      navigate('/dashboard/provider');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to send SOS',
        text: err.message || err.response?.data?.error || 'Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <button
        type="button"
        onClick={() => navigate('/dashboard/provider')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-2"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      <div
        className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center">
            <AlertTriangle size={24} className="text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Emergency Safety – SOS</h1>
            <p className="text-sm text-slate-600">
              If you feel unsafe while on a job, you can send an SOS to the ServeNCare admin team with your live
              location.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your current location is shared with the admin team.</li>
            <li>An admin will review the alert and coordinate with you.</li>
            <li>Use this only for real emergencies.</li>
          </ul>
        </div>

        {!isFemale && (
          <div className="mt-5 flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <MapPin size={18} className="text-slate-500 mt-0.5" />
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Available for women providers</p>
              <p className="mt-1">
                SOS is only enabled when your profile gender is set to <strong>Female</strong>. You can update this
                from your profile page if needed.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleSOS}
            disabled={!isFemale || sending}
            className="w-48 h-48 rounded-full flex items-center justify-center text-white text-2xl font-black tracking-wide shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #F87171, #B91C1C)',
              boxShadow: '0 25px 60px rgba(220,38,38,0.6)',
            }}
          >
            {sending ? (
              <span className="flex flex-col items-center gap-2 text-base">
                <span className="w-7 h-7 border-2 border-rose-200 border-t-white rounded-full animate-spin" />
                Sending…
              </span>
            ) : (
              'SOS'
            )}
          </button>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin size={12} /> Your precise location is only visible to admins handling safety.
          </p>
        </div>
      </div>
    </div>
  );
}

