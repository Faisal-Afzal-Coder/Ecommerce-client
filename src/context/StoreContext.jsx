import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const StoreContext = createContext();

export const themePresets = {
  'luxury-dark': {
    id: 'luxury-dark',
    name: 'Luxury Dark (Indigo & Pink)',
    bg: 'bg-slate-950',
    cardBg: 'bg-slate-900/80',
    border: 'border-slate-800',
    primaryBtn: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-lg shadow-indigo-500/25',
    secondaryBtn: 'bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500',
    accentText: 'text-indigo-400',
    accentHover: 'hover:text-indigo-300',
    accentBg: 'bg-indigo-600',
    gradientText: 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    glow: 'from-indigo-500/20 to-pink-500/20',
    announcementBg: 'bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-pink-900/90 text-indigo-100 border-b border-indigo-700/40',
    swatches: ['#6366f1', '#a855f7', '#ec4899', '#020617']
  },
  'emerald-modern': {
    id: 'emerald-modern',
    name: 'Emerald Modern (Teal & Emerald)',
    bg: 'bg-zinc-950',
    cardBg: 'bg-zinc-900/80',
    border: 'border-emerald-900/40',
    primaryBtn: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/25',
    secondaryBtn: 'bg-zinc-900 border border-emerald-800/60 text-emerald-100 hover:text-white hover:border-emerald-600',
    accentText: 'text-emerald-400',
    accentHover: 'hover:text-emerald-300',
    accentBg: 'bg-emerald-600',
    gradientText: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-300 bg-clip-text text-transparent',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    glow: 'from-emerald-500/20 to-teal-500/20',
    announcementBg: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-950 text-emerald-200 border-b border-emerald-800/40',
    swatches: ['#10b981', '#14b8a6', '#06b6d4', '#09090b']
  },
  'ocean-cyan': {
    id: 'ocean-cyan',
    name: 'Ocean Cyan (Cyan & Deep Blue)',
    bg: 'bg-slate-950',
    cardBg: 'bg-slate-900/90',
    border: 'border-cyan-900/40',
    primaryBtn: 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25',
    secondaryBtn: 'bg-slate-900 border border-cyan-800/60 text-cyan-100 hover:text-white hover:border-cyan-500',
    accentText: 'text-cyan-400',
    accentHover: 'hover:text-cyan-300',
    accentBg: 'bg-cyan-600',
    gradientText: 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    glow: 'from-cyan-500/20 to-blue-500/20',
    announcementBg: 'bg-gradient-to-r from-cyan-950 via-sky-950 to-slate-950 text-cyan-200 border-b border-cyan-800/40',
    swatches: ['#06b6d4', '#0284c7', '#3b82f6', '#020617']
  },
  'sunset-amber': {
    id: 'sunset-amber',
    name: 'Sunset Amber (Rose & Amber)',
    bg: 'bg-neutral-950',
    cardBg: 'bg-neutral-900/80',
    border: 'border-rose-900/40',
    primaryBtn: 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-500/25',
    secondaryBtn: 'bg-neutral-900 border border-rose-800/60 text-rose-100 hover:text-white hover:border-rose-500',
    accentText: 'text-rose-400',
    accentHover: 'hover:text-rose-300',
    accentBg: 'bg-rose-600',
    gradientText: 'bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    glow: 'from-rose-500/20 to-amber-500/20',
    announcementBg: 'bg-gradient-to-r from-rose-950 via-pink-950 to-neutral-950 text-amber-200 border-b border-rose-800/40',
    swatches: ['#e11d48', '#ec4899', '#f59e0b', '#0a0a0a']
  },
  'royal-purple': {
    id: 'royal-purple',
    name: 'Royal Purple (Violet & Gold)',
    bg: 'bg-slate-950',
    cardBg: 'bg-purple-950/30',
    border: 'border-purple-900/50',
    primaryBtn: 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25',
    secondaryBtn: 'bg-slate-900 border border-purple-800/60 text-purple-200 hover:text-white hover:border-purple-500',
    accentText: 'text-purple-400',
    accentHover: 'hover:text-purple-300',
    accentBg: 'bg-purple-600',
    gradientText: 'bg-gradient-to-r from-purple-400 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    glow: 'from-purple-500/20 to-violet-500/20',
    announcementBg: 'bg-gradient-to-r from-purple-950 via-violet-950 to-slate-950 text-purple-200 border-b border-purple-800/40',
    swatches: ['#9333ea', '#7c3aed', '#c084fc', '#020617']
  },
  'crimson-ruby': {
    id: 'crimson-ruby',
    name: 'Crimson Ruby (Ruby & Fiery Red)',
    bg: 'bg-stone-950',
    cardBg: 'bg-stone-900/80',
    border: 'border-red-900/40',
    primaryBtn: 'bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/25',
    secondaryBtn: 'bg-stone-900 border border-red-800/60 text-red-100 hover:text-white hover:border-red-500',
    accentText: 'text-red-400',
    accentHover: 'hover:text-red-300',
    accentBg: 'bg-red-600',
    gradientText: 'bg-gradient-to-r from-red-400 via-rose-400 to-orange-300 bg-clip-text text-transparent',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    glow: 'from-red-500/20 to-orange-500/20',
    announcementBg: 'bg-gradient-to-r from-red-950 via-rose-950 to-stone-950 text-red-200 border-b border-red-800/40',
    swatches: ['#dc2626', '#e11d48', '#ea580c', '#0c0a09']
  }
};

export const StoreProvider = ({ children }) => {
  const [storeConfig, setStoreConfig] = useState({
    themePreset: 'luxury-dark',
    navbarLogoText: 'LuxeStore',
    heroTitle: 'Discover Next-Gen Premium Products',
    heroSubtitle: 'Experience seamless online shopping with instant delivery, exclusive VIP deals, and unmatched design.',
    heroBgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    vipSectionTitle: 'Featured VIP Collection',
    vipSectionSubtitle: 'Handcrafted precision engineering meet modern aesthetic luxury.',
    aboutUsContent: 'Welcome to our platform! We build high-grade e-commerce experiences with cutting edge tech, ultra-fast shipping, and complete user satisfaction.',
    contactEmail: 'support@luxestore.com',
    contactPhone: '+1 (800) 555-LUXE',
    announcementText: '⚡ Special Offer: Free Shipping on all Online Payments | COD Available with +$100 Delivery!',
    showAnnouncement: true
  });

  const [previewPreset, setPreviewPreset] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const fetchStoreConfig = async () => {
    try {
      const res = await axios.get('/api/store');
      if (res.data) {
        setStoreConfig((prev) => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      console.error('Failed to fetch store config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchStoreConfig();
  }, []);

  const updateStoreConfig = async (newPartialConfig) => {
    try {
      const res = await axios.put('/api/store', newPartialConfig);
      setStoreConfig((prev) => ({ ...prev, ...res.data }));
      setPreviewPreset(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save store configuration'
      };
    }
  };

  const effectivePresetKey = previewPreset || storeConfig.themePreset || 'luxury-dark';
  const activeTheme = themePresets[effectivePresetKey] || themePresets['luxury-dark'];

  return (
    <StoreContext.Provider
      value={{
        storeConfig,
        loadingConfig,
        activeTheme,
        themePresets,
        previewPreset,
        setPreviewPreset,
        updateStoreConfig,
        fetchStoreConfig
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
