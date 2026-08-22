import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';
import { 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  DollarSign, 
  RefreshCw,
  User,
  PackageCheck,
  Bell,
  Radio
} from 'lucide-react';

export default function AdminOrders() {
  const { activeTheme } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const prevCountRef = useRef(0);

  // Initial fetch and Real-Time Polling Interval (Auto-Refresh without reloading)
  useEffect(() => {
    fetchAllOrders(true);

    const interval = setInterval(() => {
      fetchAllOrders(false);
    }, 3500); // Polls every 3.5 seconds for instant real-time updates

    return () => clearInterval(interval);
  }, []);

  const fetchAllOrders = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get('/api/orders');
      if (res.data) {
        // Detect if a new order just came in
        if (prevCountRef.current > 0 && res.data.length > prevCountRef.current) {
          setNewOrderAlert(true);
          setTimeout(() => setNewOrderAlert(false), 6000);
        }
        prevCountRef.current = res.data.length;
        setOrders(res.data);
      }
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, orderStatus, paymentStatus) => {
    setMessage(null);
    try {
      await axios.put(`/api/orders/${orderId}/status`, { orderStatus, paymentStatus });
      setMessage({ type: 'success', text: `Order status updated to ${orderStatus}` });
      fetchAllOrders(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    }
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-6 px-4 max-w-7xl mx-auto space-y-8`}>
      
      {/* Header with Live Sync Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Customer Orders Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Live Auto-Sync Active
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Orders placed by customers automatically update in real-time without needing page refresh.
          </p>
        </div>

        <button
          onClick={() => fetchAllOrders(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Now
        </button>
      </div>

      {/* New Incoming Order Alert Banner */}
      {newOrderAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/50 text-emerald-200 text-sm font-bold flex items-center justify-between shadow-2xl animate-bounce">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-emerald-400 animate-spin-slow" />
            <span>🔔 New Customer Order Received! The order list has been updated automatically.</span>
          </div>
          <span className="text-xs font-mono text-emerald-300">Just Now</span>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-2xl font-bold text-white">No Customer Orders Yet</h2>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            When customers place orders on your store (via COD or Online payment), they will appear here automatically in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`glass-panel p-6 sm:p-8 rounded-3xl ${activeTheme.border} space-y-6 shadow-xl`}
            >
              
              {/* Order Header & Customer Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 text-xs">
                <div>
                  <p className="text-slate-400">Order ID: <span className="font-mono text-indigo-400 font-bold">{order._id}</span></p>
                  <p className="text-slate-300 font-bold flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-pink-400" />
                    Customer: {order.shippingAddress?.name} ({order.user?.email || 'Guest'})
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Phone: {order.shippingAddress?.phone} | Address: {order.shippingAddress?.street}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Dropdowns */}
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Order Status</label>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value, order.paymentStatus)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Payment Status</label>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handleUpdateStatus(order._id, order.orderStatus, e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items List & Quantity */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Ordered Items & Quantity:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-xl border border-slate-800" />
                      <div className="flex-1">
                        <p className="text-white font-bold">{item.name}</p>
                        <p className="text-slate-400">Qty: {item.qty} × ${item.price}</p>
                      </div>
                      <span className="font-bold text-white">${item.qty * item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Totals */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Payment Method: </span>
                  <span className={`font-bold ${order.paymentMethod === 'COD' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {order.paymentMethod} {order.paymentMethod === 'COD' ? '(+$100 Delivery Fee included)' : '(Free Delivery)'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400">Total Price: </span>
                  <span className="text-xl font-black text-white">${order.totalPrice}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
