import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';
import PageLoader from '../../components/PageLoader';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  X, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

export default function AdminPayments() {
  const { activeTheme } = useStore();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'VERIFYING', 'PAID', 'REJECTED'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  // Rejection modal
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Payment screenshot details do not match the order total or account.');
  const [actionLoading, setActionLoading] = useState(false);

  // Zoom preview modal
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchPayments(true);
  }, [filterStatus]);

  const fetchPayments = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`/api/payments?status=${filterStatus}`);
      setPayments(res.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Are you sure you want to APPROVE this payment and mark the order as CONFIRMED?')) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await axios.put(`/api/payments/${paymentId}/approve`);
      setActionMessage({ type: 'success', text: res.data.message });
      fetchPayments(false);
    } catch (error) {
      setActionMessage({ type: 'error', text: error.response?.data?.message || 'Approval failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingPayment) return;

    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await axios.put(`/api/payments/${rejectingPayment._id}/reject`, {
        reason: rejectionReason
      });
      setActionMessage({ type: 'success', text: res.data.message });
      setRejectingPayment(null);
      fetchPayments(false);
    } catch (error) {
      setActionMessage({ type: 'error', text: error.response?.data?.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.orderId?._id?.toLowerCase().includes(term) ||
      p.userId?.name?.toLowerCase().includes(term) ||
      p.userId?.email?.toLowerCase().includes(term) ||
      p.transactionId?.toLowerCase().includes(term)
    );
  });

  const getDeterministicBadge = (status) => {
    switch (status) {
      case 'AMOUNT_MATCH':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AMOUNT MATCH</span>;
      case 'AMOUNT_MISMATCH':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">AMOUNT MISMATCH</span>;
      case 'INVALID_PAYMENT_PROOF':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">INVALID RECEIPT</span>;
      case 'SUSPICIOUS_PAYMENT_PROOF':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">SUSPICIOUS IMAGE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">REVIEW REQUIRED</span>;
    }
  };

  if (loading) {
    return <PageLoader label="Loading payment verification submissions..." />;
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-6 px-4 max-w-7xl mx-auto space-y-8`}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              AI Payment Verification & Approvals
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini Vision AI Integrated
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Inspect customer payment screenshots, review AI-extracted transaction amounts, and certify payments before orders are fulfilled.
          </p>
        </div>

        <button
          onClick={() => fetchPayments(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          actionMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          {['ALL', 'VERIFYING', 'PAID', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {status === 'ALL' ? 'All Payments' : status}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, email, TID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center space-y-4">
          <CreditCard className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-2xl font-bold text-white">No Payments in this View</h2>
          <p className="text-slate-400 text-xs">
            {filterStatus === 'VERIFYING'
              ? 'Great job! There are currently no pending payments awaiting verification.'
              : 'No payment submissions found matching your search filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPayments.map((payment) => {
            const ai = payment.aiResult || {};
            const deterministic = payment.deterministicResult || {};
            const isVerifying = payment.verificationStatus === 'VERIFYING';
            const isPaid = payment.verificationStatus === 'PAID';
            const isRejected = payment.verificationStatus === 'REJECTED';

            return (
              <div
                key={payment._id}
                className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden"
              >
                
                {/* Header Information */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Order ID:</span>
                      <span className="font-mono text-indigo-400 font-bold">{payment.orderId?._id || payment.orderId}</span>
                      <span className="text-slate-500 ml-2">
                        Submitted on {new Date(payment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 font-bold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-pink-400" />
                      Customer: {payment.userId?.name} ({payment.userId?.email})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-200 font-bold">
                      Method: {payment.paymentMethod}
                    </span>
                    <span className={`px-3 py-1 rounded-full font-bold uppercase text-xs ${
                      isPaid
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isRejected
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                    }`}>
                      Status: {payment.verificationStatus}
                    </span>
                  </div>
                </div>

                {/* 3-Column Inspection Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                  
                  {/* COL 1: SCREENSHOT PREVIEW (4 cols) */}
                  <div className="lg:col-span-4 space-y-3">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block">
                      Customer Uploaded Receipt:
                    </span>
                    
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 aspect-[4/3] flex items-center justify-center">
                      <img
                        src={payment.screenshotUrl}
                        alt="Receipt Screenshot"
                        className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        onClick={() => setPreviewImage(payment.screenshotUrl)}
                      />
                      <button
                        onClick={() => setPreviewImage(payment.screenshotUrl)}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs"
                      >
                        <Eye className="w-4 h-4" /> Click to Zoom & Inspect
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <p className="text-slate-400">Customer Submitted TID:</p>
                      <p className="font-mono text-white font-bold truncate">
                        {payment.transactionId || 'None provided'}
                      </p>
                    </div>
                  </div>

                  {/* COL 2: AI GEMINI ANALYSIS (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <span>Google Gemini Vision AI Audit:</span>
                      </span>
                      {getDeterministicBadge(deterministic.ruleStatus)}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-2.5">
                      
                      {/* Confidence Score Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">AI Confidence:</span>
                          <span className="font-mono font-bold text-indigo-400">
                            {Math.round((ai.confidence || 0) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                            style={{ width: `${Math.min(100, Math.round((ai.confidence || 0) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Extracted Details Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px]">Extracted Amount:</span>
                          <span className={`font-bold ${ai.amount !== null && Math.abs(ai.amount - payment.amount) > 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {ai.amount !== null ? `${ai.currency || '$'}${ai.amount}` : 'Not Detected'}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px]">Expected Amount:</span>
                          <span className="font-bold text-white">${payment.amount}</span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px]">Extracted TID:</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {ai.transactionId || 'Not Detected'}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px]">Bank / Wallet:</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {ai.paymentMethod || 'Generic Receipt'}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 col-span-2">
                          <span className="text-slate-500 block text-[10px]">Receiver Info:</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {ai.receiver || 'LuxeStore Account'}
                          </span>
                        </div>
                      </div>

                      {/* Suspicious or Anomaly flags */}
                      {ai.suspicious && (
                        <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>AI Warning: Potential screenshot anomaly or manipulation detected.</span>
                        </div>
                      )}

                      {ai.reason && (
                        <p className="text-[11px] text-slate-400 italic pt-1">
                          Note: {ai.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* COL 3: ORDER TOTALS & ADMIN ACTIONS (3 cols) */}
                  <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider block text-[11px]">
                        Order Summary:
                      </span>
                      <div className="flex justify-between text-slate-300">
                        <span>Total Due:</span>
                        <span className="text-white font-bold">${payment.amount}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Destination:</span>
                        <span className="text-white">{payment.orderId?.shippingAddress?.city || 'Karachi'}</span>
                      </div>

                      {payment.verifiedBy && (
                        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                          <p>Verified by: <strong className="text-slate-200">{payment.verifiedBy?.name}</strong></p>
                          <p>At: {new Date(payment.verifiedAt).toLocaleString()}</p>
                          {payment.rejectionReason && (
                            <p className="text-rose-400">Reason: {payment.rejectionReason}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {isVerifying ? (
                        <>
                          <button
                            onClick={() => handleApprove(payment._id)}
                            disabled={actionLoading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg hover:scale-101 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve Payment (Mark PAID)</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectingPayment(payment);
                              setRejectionReason('Screenshot details do not match the order total or transaction could not be verified.');
                            }}
                            disabled={actionLoading}
                            className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject Payment Proof</span>
                          </button>
                        </>
                      ) : isPaid ? (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Payment Approved & Order Confirmed</span>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center font-bold text-xs flex items-center justify-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>Payment Proof Rejected</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Reject Payment Proof</h3>
              <button onClick={() => setRejectingPayment(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Please specify why this payment proof is being rejected. The customer will see this message in their order tracking screen.
              </p>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Rejection Reason</label>
                <textarea
                  rows="3"
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SIZE IMAGE ZOOM PREVIEW MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl relative p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-white border border-slate-700 hover:scale-110 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-h-[85vh] w-auto mx-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}
