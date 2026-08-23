import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Palette, 
  Eye, 
  LogOut, 
  Sparkles,
  CreditCard,
  Truck
} from 'lucide-react';

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Payment AI Approvals', path: '/admin/payments', icon: CreditCard },
    { name: 'Customer Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products & Stock', path: '/admin/products', icon: Package },
    { name: 'Shipping Rates', path: '/admin/shipping', icon: Truck },
    { name: 'Registered Users', path: '/admin/users', icon: Users },
    { name: 'Theme Customizer', path: '/admin/customize', icon: Palette },
  ];

  return (
    <div className="glass-panel border-b border-slate-800 sticky top-0 z-50 mb-8 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-2 h-20">
          
          {/* Brand & Admin Badge */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-base font-black tracking-tight text-white sm:text-xl">Store Admin Panel</span>
                <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Manager
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400">Logged in as {user?.name || 'Administrator'}</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {/* View Customer Storefront Button */}
            <Link
              to="/"
              aria-label="View customer storefront"
              title="View customer storefront"
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500 shadow-md transition-all hover:scale-105"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Customer View</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Tabs (Scrollable) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-3 pt-1 border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
