import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import PageLoader from '../components/PageLoader';
import { 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Star, 
  Edit3, 
  Save, 
  Palette, 
  Image as ImageIcon,
  Type,
  CheckCircle2,
  Upload,
  Eye,
  Megaphone
} from 'lucide-react';

export default function Home() {
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { storeConfig, activeTheme, themePresets, setPreviewPreset, updateStoreConfig } = useStore();
  const navigate = useNavigate();

  const [vipProducts, setVipProducts] = useState([]);
  const [loadingVip, setLoadingVip] = useState(true);

  // Admin Live Customizer state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroBgImage: '',
    navbarLogoText: '',
    themePreset: 'luxury-dark',
    announcementText: '',
    showAnnouncement: true,
    vipSectionTitle: '',
    vipSectionSubtitle: ''
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVipProducts();
  }, []);

  useEffect(() => {
    if (storeConfig) {
      setEditForm({
        heroTitle: storeConfig.heroTitle || '',
        heroSubtitle: storeConfig.heroSubtitle || '',
        heroBgImage: storeConfig.heroBgImage || '',
        navbarLogoText: storeConfig.navbarLogoText || '',
        themePreset: storeConfig.themePreset || 'luxury-dark',
        announcementText: storeConfig.announcementText || '',
        showAnnouncement: storeConfig.showAnnouncement !== undefined ? storeConfig.showAnnouncement : true,
        vipSectionTitle: storeConfig.vipSectionTitle || '',
        vipSectionSubtitle: storeConfig.vipSectionSubtitle || ''
      });
    }
  }, [storeConfig]);

  const fetchVipProducts = async () => {
    try {
      const res = await axios.get('/api/products/vip');
      setVipProducts(res.data);
    } catch (error) {
      console.error('Error fetching VIP products:', error);
    } finally {
      setLoadingVip(false);
    }
  };

  const handlePresetChange = (presetKey) => {
    setEditForm((prev) => ({ ...prev, themePreset: presetKey }));
    setPreviewPreset(presetKey); // Real-time instant visual feedback across the entire page
  };

  const handleSaveCustomization = async () => {
    setSaving(true);
    const res = await updateStoreConfig(editForm);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/store/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditForm((prev) => ({ ...prev, heroBgImage: res.data.url }));
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Preview values if editing live
  const displayTitle = isEditing ? editForm.heroTitle : storeConfig.heroTitle;
  const displaySubtitle = isEditing ? editForm.heroSubtitle : storeConfig.heroSubtitle;
  const displayBgImage = isEditing ? editForm.heroBgImage : storeConfig.heroBgImage;
  const displayVipTitle = isEditing ? editForm.vipSectionTitle : storeConfig.vipSectionTitle;
  const displayVipSubtitle = isEditing ? editForm.vipSectionSubtitle : storeConfig.vipSectionSubtitle;

  if (loadingVip) {
    return <PageLoader label="Loading featured products..." />;
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 relative pb-20`}>
      
      {/* ADMIN FLOATING VISUAL EDITOR TOOLBAR (Shopify-Style Visual Builder) */}
      {isAdmin && (
        <div className="sticky top-24 z-40 max-w-7xl mx-auto px-4 mb-6">
          <div className="glass-panel p-4 rounded-2xl border border-pink-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                <Palette className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Shopify-Style Live Theme & Content Customizer</h4>
                <p className="text-xs text-slate-300">Click below to change color themes, hero banner, logo text & images in real-time!</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveCustomization}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes to Database'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewPreset(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-lg hover:scale-105 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Customize Store Design Live</span>
                </button>
              )}
            </div>
          </div>

          {/* Admin Customization Form Modal Drawer */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-6 glass-card rounded-2xl border border-pink-500/30 space-y-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  <span>Live Store Theme & Layout Settings</span>
                </h3>
                <span className="text-xs text-slate-400">Previewing live updates immediately</span>
              </div>

              {/* Theme Color Palette Selector with Swatches */}
              <div>
                <label className="block text-slate-300 text-xs mb-2 font-bold flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-400" /> Choose Active Color Theme (Instant Preview)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.keys(themePresets).map((key) => {
                    const preset = themePresets[key];
                    const isSelected = editForm.themePreset === key;

                    return (
                      <div
                        key={key}
                        onClick={() => handlePresetChange(key)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-900 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span className="text-[11px] font-bold text-white mb-2 truncate">{preset.name.split('(')[0]}</span>
                        <div className="flex items-center gap-1.5">
                          {preset.swatches.map((color, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-indigo-400" /> Navbar Brand Logo Text
                  </label>
                  <input
                    type="text"
                    value={editForm.navbarLogoText}
                    onChange={(e) => setEditForm({ ...editForm, navbarLogoText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-indigo-400" /> Hero Banner Main Title
                  </label>
                  <input
                    type="text"
                    value={editForm.heroTitle}
                    onChange={(e) => setEditForm({ ...editForm, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Hero Subtitle / Description Copy</label>
                  <textarea
                    rows="2"
                    value={editForm.heroSubtitle}
                    onChange={(e) => setEditForm({ ...editForm, heroSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Cover Photo Background Image URL
                  </label>
                  <input
                    type="text"
                    value={editForm.heroBgImage}
                    onChange={(e) => setEditForm({ ...editForm, heroBgImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 mb-2"
                  />
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer hover:border-slate-700 w-fit">
                    <Upload className="w-3.5 h-3.5 text-pink-400" />
                    <span>Upload New Cover Image</span>
                    <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-pink-400" /> Top Announcement Bar Banner
                  </label>
                  <input
                    type="text"
                    value={editForm.announcementText}
                    onChange={(e) => setEditForm({ ...editForm, announcementText: e.target.value })}
                    placeholder="e.g. ⚡ Special Offer: Free Shipping on all Online Payments!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.showAnnouncement}
                      onChange={(e) => setEditForm({ ...editForm, showAnnouncement: e.target.checked })}
                      className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-800 text-indigo-600"
                    />
                    <span className="text-slate-300 text-[11px]">Display Announcement Bar at top of store</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Customizations saved to database successfully! Customer view updated live.</span>
            </motion.div>
          )}
        </div>
      )}

      {/* TOP HERO BANNER (COVER PHOTO & DYNAMIC TEXT) */}
      <section className="relative max-w-7xl mx-auto px-4 pt-6 pb-16">
        <div className="relative min-h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center text-center p-8 sm:p-16">
          
          {/* Cover Photo Background Image with Gradient Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105 hover:scale-100"
            style={{ backgroundImage: `url('${displayBgImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80'}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/50" />

          {/* Hero Content Container */}
          <div className="relative z-10 max-w-3xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel ${activeTheme.badge} text-xs font-bold tracking-wide uppercase`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Official Premium Collection 2026</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight"
            >
              {displayTitle || 'Discover Next-Gen Premium Products'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              {displaySubtitle || 'Experience seamless online shopping with instant delivery, exclusive VIP deals, and unmatched design.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-4 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/products"
                className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold ${activeTheme.primaryBtn} shadow-xl hover:scale-105 transition-all`}
              >
                <span>Shop All Products</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VIP PRODUCTS SECTION (SCROLL ANIMATION ALTERNATING LEFT IMAGE / RIGHT DESC & RIGHT IMAGE / LEFT DESC) */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {displayVipTitle || 'Featured VIP Showcase'}
          </h2>
          <p className="text-slate-400 text-sm">
            {displayVipSubtitle || 'Scroll to experience our high-demand VIP products with sleek motion animations.'}
          </p>
        </div>

        {/* VIP Products List - Alternating Layout */}
        {loadingVip ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-28">
            {vipProducts.map((product, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: isEven ? -80 : 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center glass-panel p-8 sm:p-12 rounded-3xl ${activeTheme.border} shadow-2xl relative overflow-hidden`}
                >
                  
                  {/* Decorative Glow */}
                  <div className={`absolute -top-24 ${isEven ? '-left-24' : '-right-24'} w-72 h-72 rounded-full bg-gradient-to-tr ${activeTheme.glow} blur-3xl pointer-events-none`} />

                  {/* Left Column: Image or Details depending on alternating index */}
                  {isEven ? (
                    /* PRODUCT IMAGE LEFT */
                    <div className="relative group overflow-hidden rounded-2xl border border-slate-800">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/600'}
                        alt={product.name}
                        className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>VIP ITEM #{index + 1}</span>
                      </div>
                    </div>
                  ) : (
                    /* PRODUCT DESCRIPTION LEFT */
                    <div className="space-y-6 lg:pr-6">
                      <span className={`px-3 py-1 rounded-full ${activeTheme.badge} text-xs font-bold uppercase tracking-wider`}>
                        Category: {product.category}
                      </span>

                      <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                        {product.name}
                      </h3>

                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-white">
                          ${product.price}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${product.stock > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'}`}>
                          {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                        </span>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => addToCart(product, 1)}
                          disabled={product.stock <= 0}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${activeTheme.primaryBtn} shadow-lg hover:scale-105 transition-all disabled:opacity-50`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add To Cart</span>
                        </button>
                        <Link
                          to={`/product/${product._id}`}
                          className="px-6 py-3 rounded-xl font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Right Column: Details or Image depending on alternating index */}
                  {isEven ? (
                    /* PRODUCT DESCRIPTION RIGHT */
                    <div className="space-y-6 lg:pl-6">
                      <span className={`px-3 py-1 rounded-full ${activeTheme.badge} text-xs font-bold uppercase tracking-wider`}>
                        Category: {product.category}
                      </span>

                      <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                        {product.name}
                      </h3>

                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-white">
                          ${product.price}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${product.stock > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'}`}>
                          {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                        </span>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => addToCart(product, 1)}
                          disabled={product.stock <= 0}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${activeTheme.primaryBtn} shadow-lg hover:scale-105 transition-all disabled:opacity-50`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add To Cart</span>
                        </button>
                        <Link
                          to={`/product/${product._id}`}
                          className="px-6 py-3 rounded-xl font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* PRODUCT IMAGE RIGHT */
                    <div className="relative group overflow-hidden rounded-2xl border border-slate-800">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/600'}
                        alt={product.name}
                        className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>VIP ITEM #{index + 1}</span>
                      </div>
                    </div>
                  )}

                </motion.div>
              );
            })}
          </div>
        )}

      </section>

      {/* VIEW ALL PRODUCTS CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className={`glass-card p-10 sm:p-16 rounded-3xl ${activeTheme.border} text-center space-y-6 relative overflow-hidden`}>
          <div className={`absolute -inset-1 bg-gradient-to-r ${activeTheme.glow} blur-xl pointer-events-none`} />
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight relative z-10">
            Explore Our Complete Catalog
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto relative z-10">
            Browse through hundreds of high-quality items, filter by categories, check live stock availability, and enjoy seamless shipping.
          </p>
          <div className="pt-4 relative z-10">
            <Link
              to="/products"
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold ${activeTheme.primaryBtn} hover:scale-105 transition-all shadow-xl`}
            >
              <span>View All Products Path</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
