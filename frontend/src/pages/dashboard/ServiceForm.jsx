import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Save, ImagePlus } from 'lucide-react';
import Swal from 'sweetalert2';
import { services as servicesApi, categories as categoriesApi, uploadImage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ServiceAreaMap from '../../components/ServiceAreaMap';

const emptyForm = () => ({
  title: '', description: '', category_id: '',
  price_type: 'fixed', price: '', payment_frequency: 'per_service',
  service_type: 'at_customer', recurring_type: 'one_time', frequency: 1,
  latitude: null, longitude: null, radius_km: 5, address: '', images: [],
});

const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5';

export default function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isVerified = !!user?.is_verified;
  const [form, setForm] = useState(emptyForm());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const fileInputRef = useRef(null);

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  useEffect(() => {
    categoriesApi.flat()
      .then(({ data }) => setCategories((data || []).filter(c => c.parent_id)))
      .catch(() => {});

    if (id) {
      servicesApi.get(id)
        .then(({ data }) => setForm({
          title: data.title || '', description: data.description || '',
          category_id: data.category_id || '', price_type: data.price_type || 'fixed',
          price: String(data.price || ''), payment_frequency: data.payment_frequency || 'per_service',
          service_type: data.service_type || 'at_customer', recurring_type: data.recurring_type || 'one_time',
          frequency: data.frequency || 1,
          latitude: data.latitude != null ? parseFloat(data.latitude) : null,
          longitude: data.longitude != null ? parseFloat(data.longitude) : null,
          radius_km: data.radius_km != null ? parseFloat(data.radius_km) : 5,
          address: data.address || '', images: Array.isArray(data.images) ? data.images : [],
        }))
        .catch(err => {
          Swal.fire({ icon: 'error', title: 'Failed to Load', text: err.response?.data?.error || 'Could not load service.' })
            .then(() => navigate('/dashboard/provider/services'));
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category_id || !form.title || !form.price) {
      Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill in Category, Title, and Price.' });
      return;
    }
    setLoading(true);
    const payload = {
      category_id: form.category_id, title: form.title,
      description: form.description || null, price_type: form.price_type,
      price: parseFloat(form.price),
      payment_frequency: form.recurring_type === 'one_time' ? 'per_service' : form.payment_frequency,
      service_type: form.service_type, recurring_type: form.recurring_type,
      frequency: parseInt(form.frequency) || 1,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      radius_km: form.radius_km ? parseFloat(form.radius_km) : null,
      address: form.address || null, images: form.images || [],
    };
    (id ? servicesApi.update(id, payload) : servicesApi.create(payload))
      .then(() => {
        Swal.fire({ icon: 'success', title: id ? 'Updated!' : 'Created!', timer: 1800, showConfirmButton: false })
          .then(() => navigate('/dashboard/provider/services'));
      })
      .catch(err => {
        const code = err.response?.data?.code;
        const msg = err.response?.data?.error || 'Please try again.';
        if (code === 'PROVIDER_NOT_VERIFIED') {
          Swal.fire({
            icon: 'info',
            title: 'Verification required',
            text: msg,
            confirmButtonText: 'Back to services',
          }).then(() => navigate('/dashboard/provider/services'));
        } else {
          Swal.fire({ icon: 'error', title: 'Save Failed', text: msg });
        }
      })
      .finally(() => setLoading(false));
  };

  const onImageSelect = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < Math.min(files.length, 5 - (form.images || []).length); i++) {
        const url = await uploadImage(files[i]);
        setForm(f => ({ ...f, images: [...(f.images || []), url] }));
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.response?.data?.error || err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const handleLocationChange = useCallback((lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng })), []);
  const handleRadiusChange = useCallback((r) => setForm(f => ({ ...f, radius_km: r })), []);
  const handleAddressChange = useCallback((address) => setForm(f => ({ ...f, address })), []);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isNewAndUnverified = !id && !isVerified;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button type="button" onClick={() => navigate('/dashboard/provider/services')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Services
        </button>
        <h1 className="text-2xl font-bold text-slate-800">{id ? 'Edit Service' : 'Create New Service'}</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details below to {id ? 'update' : 'create'} your service listing.</p>
      </div>

      {isNewAndUnverified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-4">
          <p className="text-sm text-amber-800">Your account must be verified by an admin before you can post new services. Please complete your profile and wait for verification.</p>
          <button type="button" onClick={() => navigate('/dashboard/provider/services')}
            className="flex-shrink-0 px-3 py-1.5 text-sm font-semibold text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200">
            Back to Services
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-slate-800">Basic Information</h2>

          <div>
            <label className={labelCls}>Category <span className="text-red-400">*</span></label>
            <select value={form.category_id} onChange={e => set({ category_id: e.target.value })} required className={inputCls}>
              <option value="">Select category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Service Title <span className="text-red-400">*</span></label>
            <input type="text" value={form.title} onChange={e => set({ title: e.target.value })}
              placeholder="e.g. Professional Home Cleaning Service" required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={e => set({ description: e.target.value })}
              placeholder="Describe your service, what's included, and what makes it special…" rows={4} className={inputCls} />
            <p className="text-xs text-slate-400 mt-1">A good description helps customers understand what you offer.</p>
          </div>
        </div>

        {/* Type & Schedule */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-slate-800">Service Type & Schedule</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Service Location <span className="text-red-400">*</span></label>
              <select value={form.service_type} onChange={e => set({ service_type: e.target.value })} className={inputCls}>
                <option value="at_customer">At customer's location</option>
                <option value="at_provider">At my location</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Recurring Type <span className="text-red-400">*</span></label>
              <select value={form.recurring_type} onChange={e => {
                const t = e.target.value;
                set({ recurring_type: t, payment_frequency: t === 'one_time' ? 'per_service' : form.payment_frequency });
              }} className={inputCls}>
                <option value="one_time">One Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {form.recurring_type !== 'one_time' && (
            <div>
              <label className={labelCls}>
                Frequency <span className="text-slate-400 font-normal">(times per {form.recurring_type === 'daily' ? 'day' : form.recurring_type === 'weekly' ? 'week' : 'month'})</span>
              </label>
              <input type="number" min="1" max="10" value={form.frequency}
                onChange={e => set({ frequency: e.target.value })} className={inputCls} />
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-slate-800">Pricing</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Price Type <span className="text-red-400">*</span></label>
              <select value={form.price_type} onChange={e => set({ price_type: e.target.value })} className={inputCls}>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Price (₹) <span className="text-red-400">*</span></label>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={e => set({ price: e.target.value })} placeholder="0.00" required className={inputCls} />
              <p className="text-xs text-slate-400 mt-1">
                {form.price_type === 'hourly' ? 'Per hour' : 'Total price for the service'}
              </p>
            </div>
          </div>

          {form.recurring_type !== 'one_time' && (
            <div>
              <label className={labelCls}>Payment Frequency <span className="text-red-400">*</span></label>
              <select value={form.payment_frequency} onChange={e => set({ payment_frequency: e.target.value })} className={inputCls}>
                <option value="per_service">Per Service</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        {/* Service Area */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-bold text-slate-800">Service Area / Location</h2>
            <p className="text-xs text-slate-500 mt-1">
              {form.service_type === 'at_customer'
                ? 'Set the area where you can provide this service. Click on the map to set your location and adjust the radius.'
                : form.service_type === 'at_provider'
                  ? 'Set your business location. Customers will see this address.'
                  : 'Set your general location for reference.'}
            </p>
          </div>
          <ServiceAreaMap
            latitude={form.latitude} longitude={form.longitude}
            radius={form.radius_km} address={form.address}
            serviceType={form.service_type}
            onLocationChange={handleLocationChange}
            onRadiusChange={handleRadiusChange}
            onAddressChange={handleAddressChange}
          />
        </div>

        {/* Images */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-bold text-slate-800">Service Images</h2>
            <p className="text-xs text-slate-500 mt-1">Add up to 5 high-quality images. The first image will be used as the thumbnail.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {(form.images || []).map((url, idx) => (
              <div key={idx} className="relative group w-24 h-20 rounded-xl overflow-hidden border border-slate-200">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-black/60 text-white py-0.5">
                    THUMBNAIL
                  </span>
                )}
                <button type="button" onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
              </div>
            ))}

            {(form.images || []).length < 5 && (
              <label className={`flex flex-col items-center justify-center gap-2 w-24 h-20 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${uploading ? 'border-slate-200 bg-slate-50' : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'}`}>
                <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={onImageSelect} disabled={uploading} />
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
                ) : (
                  <ImagePlus size={20} className="text-emerald-500" />
                )}
                <span className="text-[10px] text-slate-400 font-medium">{uploading ? 'Uploading…' : 'Add photo'}</span>
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-4">
          <button type="button" onClick={() => navigate('/dashboard/provider/services')} disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading || uploading || isNewAndUnverified}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors shadow-sm shadow-emerald-500/20">
            <Save size={16} />
            {loading ? 'Saving…' : id ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
}
