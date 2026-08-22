import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ShieldCheck, Award, HeartHandshake, Users } from 'lucide-react';

export default function AboutUs() {
  const { storeConfig, activeTheme } = useStore();

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-12 px-4 max-w-5xl mx-auto space-y-12`}>
      
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wide">
          Our Brand Mission
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          About {storeConfig.navbarLogoText || 'LuxeStore'}
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          {storeConfig.aboutUsContent || 'LuxeStore is a premier destination for high-end lifestyle products and technology.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold text-lg">Uncompromised Quality</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Every product is handpicked and undergoes rigorous multi-point quality inspections.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold text-lg">Secure COD & Online</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Choose between Cash on Delivery (+100 fee) or direct online card payment options.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold text-lg">24/7 Dedicated Support</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Our team is available round-the-clock to assist with tracking and product queries.
          </p>
        </div>
      </div>

    </div>
  );
}
