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
  ShoppingBag
} from 'lucide-react';

export default function MyOrders() {
  const { user } = useAuth();
  const { activeTheme } = useStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

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

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

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
            Track live shipping updates for your purchases. Orders can be cancelled prior to dispatch.
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
            const isCancelled = order.orderStatus === 'Cancelled';
            const canCancel = ['Pending', 'Processing'].includes(order.orderStatus);

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
                      Plated on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full font-bold uppercase ${
                      isCancelled
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : order.orderStatus === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      Status: {order.orderStatus}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-semibold">
                      Payment: {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                </div>

                {/* PROGRESS STEP TRACKER BAR */}
                {!isCancelled ? (
                  <div className="py-4">
                    <div className="grid grid-cols-4 gap-2 relative">
                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step} className="flex flex-col items-center text-center space-y-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                              isCompleted
                                ? `${activeTheme.primaryBtn} border-transparent shadow-lg`
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className={`text-xs font-semibold ${isCurrent ? `${activeTheme.accentText} font-bold` : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
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
                    <span>This order was cancelled and refunded.</span>
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
                    <span className="text-slate-400">Shipping Fee: </span>
                    <span className="text-slate-200 font-bold">${order.shippingFee}</span>
                    <span className="text-slate-400 ml-4">Total Paid/Due: </span>
                    <span className="text-white text-base font-black ml-1">${order.totalPrice}</span>
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
                        * Cannot cancel order after it has been shipped
                      </span>
                    ) : null}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
