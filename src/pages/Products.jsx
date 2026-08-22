import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { Search, Filter, ShoppingBag, Star, CheckCircle, AlertCircle, ArrowUpDown } from 'lucide-react';

export default function Products() {
  const { addToCart } = useCart();
  const { activeTheme } = useStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');

  const categories = ['All', 'Electronics', 'Accessories', 'Fashion', 'Furniture'];

  useEffect(() => {
    fetchProducts();
  }, [keyword, category, inStockOnly, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (category !== 'All') params.category = category;
      if (inStockOnly) params.inStock = 'true';
      if (sort) params.sort = sort;

      const res = await axios.get('/api/products', { params });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-12 px-4 max-w-7xl mx-auto space-y-8`}>
      
      {/* Header Title */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Product Catalog
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Find top-rated electronics, fashion, and luxury accessories with instant stock availability.
        </p>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className={`glass-panel p-6 rounded-3xl ${activeTheme.border} space-y-6`}>
        
        {/* Top Row: Search Input & Sort Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-4 top-4 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="newest">Sort by: Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular / Best Sellers</option>
            </select>
          </div>

        </div>

        {/* Bottom Row: Category Pills & In-Stock Checkbox */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" /> Categories:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === cat
                    ? `${activeTheme.primaryBtn} shadow-md`
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* In-Stock Filter Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show In-Stock Only</span>
          </label>

        </div>

      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl border border-slate-800 space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No products found</h3>
          <p className="text-slate-400 text-sm">Try broadening your search term or clearing the selected category filters.</p>
          <button
            onClick={() => {
              setKeyword('');
              setCategory('All');
              setInStockOnly(false);
              setSort('newest');
            }}
            className={`px-6 py-2.5 rounded-xl ${activeTheme.primaryBtn} text-xs font-bold`}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className={`glass-panel rounded-3xl ${activeTheme.border} overflow-hidden group hover:border-slate-700 transition-all duration-300 flex flex-col justify-between`}
            >
              
              {/* Product Card Image */}
              <div className="relative overflow-hidden bg-slate-900 h-64">
                <img
                  src={product.images[0] || 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full ${activeTheme.badge} text-xs font-bold`}>
                  {product.category}
                </span>

                {product.isVip && (
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[11px] font-black tracking-wide uppercase flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-slate-950" /> VIP
                  </span>
                )}
              </div>

              {/* Product Card Details */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className={`text-lg font-bold text-white line-clamp-1 ${activeTheme.accentHover} transition-colors`}>
                    {product.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-900">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white">
                      ${product.price}
                    </span>

                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      product.stock > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      to={`/product/${product._id}`}
                      className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold text-center hover:border-slate-700 hover:text-white transition-all"
                    >
                      View Details
                    </Link>

                    <button
                      onClick={() => addToCart(product, 1)}
                      disabled={product.stock <= 0}
                      className={`py-2.5 rounded-xl ${activeTheme.primaryBtn} text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 transition-all`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
