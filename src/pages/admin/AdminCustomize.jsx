import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  FileText, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Sparkles,
  Eye,
  Megaphone,
  ShoppingBag,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminCustomize() {
  const { storeConfig, activeTheme, themePresets, setPreviewPreset, updateStoreConfig } = useStore();

  const [form, setForm] = useState({
    themePreset: 'luxury-dark',
    navbarLogoText: 'LuxeStore',
    heroTitle: '',
    heroSubtitle: '',
    heroBgImage: '',
    vipSectionTitle: '',
    vipSectionSubtitle: '',
    aboutUsContent: '',
    contactEmail: '',
    contactPhone: '',
    announcementText: '',
    showAnnouncement: true
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (storeConfig) {
      setForm({
        themePreset: storeConfig.themePreset || 'luxury-dark',
        navbarLogoText: storeConfig.navbarLogoText || 'LuxeStore',
        heroTitle: storeConfig.heroTitle || '',
        heroSubtitle: storeConfig.heroSubtitle || '',
        heroBgImage: storeConfig.heroBgImage || '',
        vipSectionTitle: storeConfig.vipSectionTitle || '',
        vipSectionSubtitle: storeConfig.vipSectionSubtitle || '',
        aboutUsContent: storeConfig.aboutUsContent || '',
        contactEmail: storeConfig.contactEmail || '',
        contactPhone: storeConfig.contactPhone || '',
        announcementText: storeConfig.announcementText || '',
        showAnnouncement: storeConfig.showAnnouncement !== undefined ? storeConfig.showAnnouncement : true
      });
    }
  }, [storeConfig]);

  const handleSelectTheme = (presetKey) => {
    setForm((prev) => ({ ...prev, themePreset: presetKey }));
    setPreviewPreset(presetKey); // Triggers real-time instant visual theme change across the whole application
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/store/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((prev) => ({ ...prev, heroBgImage: res.data.url }));
      setMessage({ type: 'success', text: 'Hero background image uploaded to Cloudinary successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Cloudinary image upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await updateStoreConfig(form);
    if (res.success) {
      setMessage({ type: 'success', text: 'Store theme, content, and visual customizations saved to database!' });
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
    setSaving(false);
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-6 px-4 max-w-6xl mx-auto space-y-8`}>
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Palette className="w-8 h-8 text-pink-400" />
            <span>Shopify-Style Visual Theme Builder</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Customize color themes, announcement banner, hero graphics, logo brand text, and marketing copy live.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs shadow-md transition-all"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>View Customer Storefront</span>
          </Link>
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

      {/* INTERACTIVE LIVE PREVIEW SANDBOX (Instant Visual Feedback) */}
      <div className={`glass-card p-6 rounded-3xl ${activeTheme.border} space-y-4 shadow-2xl relative overflow-hidden`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" /> Live Interactive Preview of Current Settings
          </span>
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${activeTheme.badge}`}>
            Active Theme: {activeTheme.name}
          </span>
        </div>

        {/* Mini Preview Component */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <span className="font-extrabold text-white text-lg">{form.navbarLogoText || 'LuxeStore'}</span>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTheme.primaryBtn}`}>
                Sample Button
              </span>
            </div>
          </div>

          <div className="space-y-2 py-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${activeTheme.badge}`}>
              PREVIEW BANNER
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {form.heroTitle || 'Your Custom Banner Title'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              {form.heroSubtitle || 'Your custom banner subtitle and store description copy will appear right here.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        
        {/* 1. COLOR THEMES PALETTE SWITCHER */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-400" />
              <span>1. Choose Color Theme Palette (Click to Preview Live)</span>
            </h2>
            <span className="text-slate-400 text-[11px]">Clicking any theme updates the whole UI instantly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(themePresets).map((presetKey) => {
              const preset = themePresets[presetKey];
              const isSelected = form.themePreset === presetKey;

              return (
                <div
                  key={presetKey}
                  onClick={() => handleSelectTheme(presetKey)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-400 ring-2 ring-indigo-500/50 text-white shadow-xl scale-102'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-sm text-white">{preset.name}</p>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  
                  {/* Swatches Visual */}
                  <div className="flex items-center gap-2">
                    {preset.swatches.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded-full border border-white/20 shadow-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. TOP ANNOUNCEMENT BAR BANNER */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <span>2. Top Announcement Bar</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Announcement Banner Message</label>
              <input
                type="text"
                value={form.announcementText}
                onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
                placeholder="⚡ Special Offer: Free Shipping on all Online Orders!"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.showAnnouncement}
                onChange={(e) => setForm({ ...form, showAnnouncement: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600"
              />
              <span className="text-slate-300 font-semibold">Enable Announcement Bar at the top of the website</span>
            </label>
          </div>
        </div>

        {/* 3. HERO BANNER & LOGO CUSTOMIZER */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Type className="w-5 h-5 text-pink-400" />
            <span>3. Brand Logo & Homepage Hero Banner</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Navbar Logo Brand Name</label>
              <input
                type="text"
                value={form.navbarLogoText}
                onChange={(e) => setForm({ ...form, navbarLogoText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Hero Banner Main Title</label>
              <input
                type="text"
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Hero Banner Subtitle / Description</label>
            <textarea
              rows="2"
              value={form.heroSubtitle}
              onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Cover Photo Background Image URL or Upload</label>
            <input
              type="text"
              value={form.heroBgImage}
              onChange={(e) => setForm({ ...form, heroBgImage: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white mb-2"
            />
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer hover:border-slate-700 w-fit">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload Cover Image via Cloudinary'}</span>
              <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* 4. VIP COLLECTION SECTION CUSTOMIZER */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>4. VIP Showcase Section Headings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">VIP Section Title</label>
              <input
                type="text"
                value={form.vipSectionTitle}
                onChange={(e) => setForm({ ...form, vipSectionTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">VIP Section Subtitle</label>
              <input
                type="text"
                value={form.vipSectionSubtitle}
                onChange={(e) => setForm({ ...form, vipSectionSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 5. PAGE CONTENT CUSTOMIZER (ABOUT US & CONTACT US) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>5. About Us & Contact Information</span>
          </h2>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">About Us Content Copy</label>
            <textarea
              rows="4"
              value={form.aboutUsContent}
              onChange={(e) => setForm({ ...form, aboutUsContent: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Support Email Address</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Support Phone Number</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-4 rounded-2xl ${activeTheme.primaryBtn} text-white font-bold text-base shadow-xl hover:scale-101 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Publishing Changes...' : 'Publish & Save All Store Customizations'}</span>
        </button>

      </form>

    </div>
  );
}
