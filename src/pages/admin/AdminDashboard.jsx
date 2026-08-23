import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';
import PageLoader from '../../components/PageLoader';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Package, 
  Sparkles, 
  ArrowUpRight,
  Edit3,
  Plus,
  Eye,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { activeTheme } = useStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats(true);

    const interval = setInterval(() => {
      fetchDashboardStats(false);
    }, 4000); // Auto-polls every 4 seconds for live metric updates

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get('/api/orders/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const hasSales = stats && stats.topSellingProducts && stats.topSellingProducts.length > 0 && stats.topSellingProducts[0].salesCount > 0;

  if (loading) {
    return <PageLoader label="Loading dashboard analytics..." />;
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-6 px-4 max-w-7xl mx-auto space-y-8`}>
      
      {/* Header Banner with Live Indicator */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Store Performance & Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Live Real-Time Analytics
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Live metrics calculated directly from database records, automatically updated when orders are placed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          <button
            onClick={() => fetchDashboardStats(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync
          </button>
          <Link
            to="/admin/products"
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold ${activeTheme.primaryBtn} shadow-lg text-xs transition-all`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/customize"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold bg-slate-900 border border-slate-700 text-white shadow-lg hover:border-slate-500 transition-all text-xs"
          >
            <Edit3 className="w-4 h-4 text-pink-400" />
            <span>Theme Customizer</span>
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white text-xs transition-all"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Customer View</span>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
          
          {/* STAT CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Orders Card */}
            <div className={`glass-panel p-6 rounded-3xl ${activeTheme.border} space-y-3 relative overflow-hidden shadow-lg`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Orders</span>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-white">{stats?.totalOrders || 0}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>{stats?.totalOrders > 0 ? `${stats.totalOrders} total order(s) placed` : 'No orders placed yet'}</span>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className={`glass-panel p-6 rounded-3xl ${activeTheme.border} space-y-3 relative overflow-hidden shadow-lg`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Revenue</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-white">${stats?.totalRevenue || 0}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>From Paid & Delivered orders</span>
              </div>
            </div>

            {/* Top Products Card */}
            <div className={`glass-panel p-6 rounded-3xl ${activeTheme.border} space-y-3 relative overflow-hidden shadow-lg`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Top Selling Product</span>
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              {hasSales ? (
                <>
                  <p className="text-sm font-bold text-white truncate">
                    {stats?.topSellingProducts?.[0]?.name}
                  </p>
                  <span className="text-[11px] text-pink-400 font-semibold">
                    {stats?.topSellingProducts?.[0]?.salesCount} units sold
                  </span>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-400">No sales recorded yet</p>
                  <span className="text-[11px] text-slate-500">Sales update on checkout</span>
                </>
              )}
            </div>

            {/* Quick Admin Actions */}
            <div className={`glass-panel p-6 rounded-3xl ${activeTheme.border} space-y-3 flex flex-col justify-between shadow-lg`}>
              <span className="text-xs text-slate-400 font-bold uppercase">Quick Navigation</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Link to="/admin/payments" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-semibold text-slate-200 hover:text-indigo-400">
                  Payments
                </Link>
                <Link to="/admin/orders" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-semibold text-slate-200 hover:text-indigo-400">
                  Orders
                </Link>
                <Link to="/admin/shipping" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-semibold text-slate-200 hover:text-indigo-400">
                  Shipping
                </Link>
                <Link to="/admin/products" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-semibold text-slate-200 hover:text-indigo-400">
                  Products
                </Link>
                <Link to="/admin/users" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-semibold text-slate-200 hover:text-indigo-400">
                  Users
                </Link>
                <Link to="/admin/customize" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-semibold text-slate-200 hover:text-indigo-400">
                  Themes
                </Link>
              </div>
            </div>

          </div>

          {/* TOP SELLING PRODUCTS PROGRESS TABLE */}
          <div className={`glass-panel p-4 sm:p-8 rounded-3xl ${activeTheme.border} space-y-6 shadow-xl`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Top Selling Products Breakdown</span>
              </h3>
              <Link to="/admin/products" className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
                Manage Inventory & Stock <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {hasSales ? (
              <div className="space-y-4">
                {stats?.topSellingProducts?.filter(p => p.salesCount > 0).map((product, idx) => (
                  <div key={product._id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="min-w-0 break-words font-bold text-white text-sm">{product.name}</span>
                        <span className="text-slate-400">(${product.price})</span>
                      </div>
                      <span className="font-mono text-indigo-400 font-bold">{product.salesCount} sold</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                        style={{ width: `${Math.min(100, (product.salesCount / Math.max(1, stats.topSellingProducts[0].salesCount)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-white text-sm font-semibold">No Sales History Yet</p>
                <p className="text-slate-400 text-xs">When customers purchase items from the catalog, sales metrics and rankings will appear here automatically.</p>
              </div>
            )}
          </div>

      </div>

    </div>
  );
}
