import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import PageLoader from '../components/PageLoader';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  Upload,
  Eye,
  FileText
} from 'lucide-react';

export default function MyOrders() {
  const { user } = useAuth();
  const { activeTheme } = useStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Upload proof modal state
  const [uploadModalOrder, setUploadModalOrder] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTid, setUploadTid] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders/myorders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancellingId(orderId);
    setActionMessage(null);

    try {
      const res = await axios.put(`/api/orders/${orderId}/cancel`);
      setActionMessage({ type: 'success', text: res.data.message });
      fetchMyOrders();
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to cancel order'
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleUploadProofSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a payment screenshot to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    try {
      // 1. Upload screenshot
      const formData = new FormData();
      formData.append('screenshot', uploadFile);
      const uploadRes = await axios.post('/api/payments/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. Submit payment proof
      const submitRes = await axios.post('/api/payments/submit', {
        orderId: uploadModalOrder._id,
        screenshotUrl: uploadRes.data.screenshotUrl,
        transactionId: uploadTid,
        paymentMethod: uploadModalOrder.paymentMethod
      });

      setActionMessage({ type: 'success', text: submitRes.data.message });
      setUploadModalOrder(null);
      setUploadFile(null);
      setUploadTid('');
      fetchMyOrders();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload payment proof');
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatusStepIndex = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  const statusSteps = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  const getPaymentBadge = (paymentStatus) => {
    const status = (paymentStatus || '').toUpperCase();
    switch (status) {
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Payment Verified (PAID)
          </span>
        );
      case 'VERIFYING':
        return (
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-1.5 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Verification In Progress
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Proof Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Payment Pending
          </span>
        );
    }
  };

  if (loading) {
    return <PageLoader label="Loading your orders..." />;
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-12 px-4 max-w-7xl mx-auto space-y-8`}>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            My Orders & Tracking Progress
          </h1>
          <p className="text-slate-400 text-sm">
            Track live shipping updates, AI payment verification receipts, and order statuses.
          </p>
        </div>

        <button
          onClick={fetchMyOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          actionMessage.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center space-y-4">
          <Package className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-2xl font-bold text-white">No Orders Found</h2>
          <p className="text-slate-400 text-sm">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const currentStepIdx = getStatusStepIndex(order.orderStatus);
            const isCancelled = order.orderStatus?.toUpperCase() === 'CANCELLED';
            const canCancel = ['PENDING', 'Pending', 'PROCESSING', 'Processing'].includes(order.orderStatus);
            const isManualPayment = ['BANK_TRANSFER', 'EASYPAISA', 'JAZZCASH'].includes(order.paymentMethod);
            const paymentStatusUpper = (order.paymentStatus || '').toUpperCase();

            return (
              <div
                key={order._id}
                className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6"
              >
                
                {/* Header Information */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Order ID: </span>
                    <span className="font-mono text-indigo-400 font-bold">{order._id}</span>
                    <span className="text-slate-500 ml-3">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full font-bold uppercase ${
                      isCancelled
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : order.orderStatus?.toUpperCase() === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      Order: {order.orderStatus}
                    </span>

                    {getPaymentBadge(order.paymentStatus)}
                  </div>
                </div>

                {/* Verification Notice Banner if Manual Payment */}
                {isManualPayment && paymentStatusUpper === 'VERIFYING' && (
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>
                        Payment verification submitted. Our team and AI verify proofs within 24 hours. Your order status will update to CONFIRMED upon approval.
                      </span>
                    </div>
                    {order.payment?.screenshotUrl && (
                      <a
                        href={order.payment.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Receipt
                      </a>
                    )}
                  </div>
                )}

                {/* Rejected Notice with Re-upload Action */}
                {paymentStatusUpper === 'REJECTED' && (
                  <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Payment Proof Rejected</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Reason: {order.payment?.rejectionReason || 'The uploaded receipt was unreadable or amount did not match.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setUploadModalOrder(order)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
                    >
                      <Upload className="w-3.5 h-3.5" /> Re-upload Payment Proof
                    </button>
                  </div>
                )}

                {/* Pending Manual Transfer Proof Upload */}
                {isManualPayment && paymentStatusUpper === 'PENDING' && !order.payment && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Payment Proof Required: Please upload your bank/wallet transfer screenshot to initiate verification.
                      </span>
                    </div>
                    <button
                      onClick={() => setUploadModalOrder(order)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Screenshot Proof
                    </button>
                  </div>
                )}

                {/* PROGRESS STEP TRACKER BAR */}
                {!isCancelled ? (
                  <div className="py-4">
                    <div className="grid grid-cols-5 gap-2 relative">
                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step} className="flex flex-col items-center text-center space-y-2">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                              isCompleted
                                ? `${activeTheme.primaryBtn} border-transparent shadow-lg text-white`
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className={`text-[11px] sm:text-xs font-semibold ${isCurrent ? `${activeTheme.accentText} font-bold` : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    <span>This order was cancelled.</span>
                  </div>
                )}

                {/* Item List */}
                <div className="space-y-3">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">Ordered Items:</h4>
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-slate-800" />
                      <div className="flex-1">
                        <p className="text-white font-bold">{item.name}</p>
                        <p className="text-slate-400">Qty: {item.qty} × ${item.price}</p>
                      </div>
                      <span className="font-bold text-white text-sm">${item.qty * item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Totals & Cancel Button */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Shipping ({order.shippingAddress?.city}): </span>
                    <span className="text-slate-200 font-bold">${order.shippingFee}</span>
                    <span className="text-slate-400 ml-4">Total Amount: </span>
                    <span className="text-white text-base font-black ml-1 font-mono">${order.totalPrice}</span>
                  </div>

                  <div>
                    {canCancel ? (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingId === order._id}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold transition-all disabled:opacity-50"
                      >
                        {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    ) : !isCancelled ? (
                      <span className="text-slate-500 text-[11px] font-semibold italic">
                        * Order in progress
                      </span>
                    ) : null}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD PAYMENT PROOF MODAL */}
      {uploadModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Upload Payment Receipt</h3>
              <button onClick={() => setUploadModalOrder(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadProofSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-slate-300">
                <p>Order ID: <strong className="text-white font-mono">{uploadModalOrder._id}</strong></p>
                <p>Total Due: <strong className="text-emerald-400">${uploadModalOrder.totalPrice}</strong></p>
                <p>Method: <strong className="text-white">{uploadModalOrder.paymentMethod}</strong></p>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Transaction / Reference ID (Optional)</label>
                <input
                  type="text"
                  value={uploadTid}
                  onChange={(e) => setUploadTid(e.target.value)}
                  placeholder="e.g. TID-12345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Screenshot Image (Max 5MB)</label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadLoading ? 'Uploading & Analyzing Proof...' : 'Submit Payment Proof'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
