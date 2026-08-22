import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Sparkles, Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Footer() {
  const { storeConfig, activeTheme } = useStore();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-20">
      
      {/* Value Proposition Highlights */}
      <div className="max-w-7xl mx-auto px-4 py-10 border-b border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-base">Express Delivery</h4>
            <p className="text-xs text-slate-400">Cash on Delivery (COD +100) or Online Payment</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-base">Authentic Quality</h4>
            <p className="text-xs text-slate-400">100% Verified premium products & warranty</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-base">Easy Order Cancellation</h4>
            <p className="text-xs text-slate-400">Cancel anytime before shipment dispatch</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${activeTheme.primaryBtn} flex items-center justify-center`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">
              {storeConfig.navbarLogoText || 'LuxeStore'}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            {storeConfig.aboutUsContent || 'Next-Gen E-Commerce experience built with modern visual engineering and fast order processing.'}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/" className="hover:text-white transition-colors">Home Page</Link></li>
            <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-white font-bold mb-4">Customer Account</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/my-orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
            <li><Link to="/profile" className="hover:text-white transition-colors">Shipping Profile</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Customer Login</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Register Account</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 text-xs">
          <h4 className="text-white font-bold mb-4">Contact Info</h4>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{storeConfig.contactEmail || 'support@luxestore.com'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{storeConfig.contactPhone || '+1 (800) 555-LUXE'}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Global Fulfillment Network</span>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © 2026 {storeConfig.navbarLogoText || 'LuxeStore'}. All rights reserved. Built with React, Tailwind & Framer Motion.
      </div>
    </footer>
  );
}
