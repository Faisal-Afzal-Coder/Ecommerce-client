import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';
import PageLoader from '../../components/PageLoader';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  MapPin, 
  DollarSign, 
  Scale, 
  RefreshCw,
  Clock
} from 'lucide-react';

export default function AdminShipping() {
  const { activeTheme } = useStore();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    city: '',
    province: 'Punjab',
    area: '',
    baseRate: 180,
    weightFrom: 0,
    weightTo: 1,
    additionalWeightRate: 50,
    freeShippingThreshold: 0,
    estimatedDays: '2-3 Business Days',
    active: true
  });

  const provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Federal', 'All Regions'];

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/shipping');
      setRates(res.data);
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      city: '',
      province: 'Punjab',
      area: '',
      baseRate: 180,
      weightFrom: 0,
      weightTo: 1,
      additionalWeightRate: 50,
      freeShippingThreshold: 0,
      estimatedDays: '2-3 Business Days',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rate) => {
    setEditingId(rate._id);
    setForm({
      city: rate.city,
      province: rate.province || 'Punjab',
      area: rate.area || '',
      baseRate: rate.baseRate,
      weightFrom: rate.weightFrom || 0,
      weightTo: rate.weightTo || 1,
      additionalWeightRate: rate.additionalWeightRate || 0,
      freeShippingThreshold: rate.freeShippingThreshold || 0,
      estimatedDays: rate.estimatedDays || '2-4 Business Days',
      active: rate.active !== undefined ? rate.active : true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      if (editingId) {
        await axios.put(`/api/shipping/${editingId}`, form);
        setMessage({ type: 'success', text: 'Shipping rate updated successfully!' });
      } else {
        await axios.post('/api/shipping', form);
        setMessage({ type: 'success', text: 'New shipping rate rule created!' });
      }
      setIsModalOpen(false);
      fetchRates();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipping rule?')) return;
    try {
      await axios.delete(`/api/shipping/${id}`);
      setMessage({ type: 'success', text: 'Shipping rule deleted' });
      fetchRates();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Delete failed' });
    }
  };

  if (loading) {
    return <PageLoader label="Loading shipping rates..." />;
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-6 px-4 max-w-7xl mx-auto space-y-8`}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Configurable Shipping Rates
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Truck className="w-3.5 h-3.5" />
              Dynamic Rule Engine
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Manage city-wise base rates, extra weight surcharges, and delivery estimates calculated automatically during customer checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRates}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-xl hover:scale-105 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add City Shipping Rule</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Shipping Rates Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">City & Province</th>
                <th className="p-4">Base Rate (Up to 1kg)</th>
                <th className="p-4">Extra kg Surcharge</th>
                <th className="p-4">Free Shipping Above</th>
                <th className="p-4">Est. Delivery Time</th>
                <th className="p-4">Status</th>
                <th className="sticky right-0 z-10 bg-slate-900/95 p-4 text-right shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.9)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {rates.map((rate) => (
                <tr key={rate._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{rate.city}</p>
                        <p className="text-[11px] text-slate-400">{rate.province || 'Standard Region'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-white text-sm">
                    ${rate.baseRate}
                  </td>
                  <td className="p-4 font-mono text-slate-300">
                    +${rate.additionalWeightRate}/kg
                  </td>
                  <td className="p-4 font-mono">
                    {rate.freeShippingThreshold > 0 ? (
                      <span className="text-emerald-400 font-bold">${rate.freeShippingThreshold}</span>
                    ) : (
                      <span className="text-slate-500">Disabled</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-300">
                    {rate.estimatedDays}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold ${
                      rate.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {rate.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="sticky right-0 z-10 bg-slate-950 p-4 text-right shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.9)]">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(rate)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rate._id)}
                        className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editingId ? 'Edit Shipping Rate Rule' : 'Add New Shipping Rate Rule'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City Name</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Islamabad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Province / Region</label>
                  <select
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  >
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Base Shipping Fee ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.baseRate}
                    onChange={(e) => setForm({ ...form, baseRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Extra kg Rate ($/kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.additionalWeightRate}
                    onChange={(e) => setForm({ ...form, additionalWeightRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Free Shipping Threshold ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.freeShippingThreshold}
                    onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
                    placeholder="0 = Disabled"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Estimated Delivery Time</label>
                  <input
                    type="text"
                    value={form.estimatedDays}
                    onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
                    placeholder="e.g. 2-3 Business Days"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600"
                />
                <span className="text-white font-bold text-xs">Enable this shipping rate rule for checkout</span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-sm shadow-xl mt-2"
              >
                {editingId ? 'Save Shipping Rule' : 'Create Shipping Rule'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
