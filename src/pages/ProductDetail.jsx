import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import PageLoader from '../components/PageLoader';
import { 
  ShoppingBag, 
  Zap, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Truck,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { activeTheme } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data);
      if (res.data.images && res.data.images.length > 0) {
        setSelectedImage(res.data.images[0]);
      }
    } catch (error) {
      console.error('Error fetching product detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, qty);
      navigate('/checkout');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please enter a review comment');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await axios.post(`/api/products/${id}/reviews`, { rating, comment });
      setReviewSuccess('Review submitted successfully!');
      setComment('');
      fetchProductDetails();
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-slate-400">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-12 px-4 max-w-7xl mx-auto space-y-12`}>
      
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </Link>

      {/* Main Grid: Gallery Left, Details Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 h-96 sm:h-[450px]">
            <img
              src={selectedImage || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Selectors */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-indigo-500 scale-105' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full ${activeTheme.badge} text-xs font-bold uppercase`}>
                {product.category}
              </span>

              {/* Rating Summary */}
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-xs text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating ? product.rating.toFixed(1) : '5.0'} ({product.numReviews || 0} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 py-2 border-y border-slate-800/80">
              <span className="text-3xl font-black text-white">
                ${product.price}
              </span>

              <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                product.stock > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {product.stock > 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock ({product.stock} left)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Out of Stock</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>

            {/* Value Guarantees */}
            <div className="grid grid-cols-2 gap-3 py-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <Truck className={`w-4 h-4 ${activeTheme.accentText}`} />
                <span>Cash on Delivery (+100) or Online</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Genuine Quality Guarantee</span>
              </div>
            </div>

          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-bold uppercase">Quantity:</span>
              <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3.5 py-1.5 text-slate-300 hover:text-white font-bold text-base"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-white">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-3.5 py-1.5 text-slate-300 hover:text-white font-bold text-base"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => addToCart(product, qty)}
                disabled={product.stock <= 0}
                className="w-full py-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className={`w-full py-3.5 rounded-2xl ${activeTheme.primaryBtn} text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 transition-all hover:scale-102`}
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* REVIEWS & RATINGS SECTION */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
          <span>Customer Reviews ({product.reviews ? product.reviews.length : 0})</span>
        </h2>

        {/* Existing Reviews List */}
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((rev) => (
              <div key={rev._id} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{rev.name}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-slate-500">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No reviews yet for this product. Be the first to leave a review!</p>
        )}

        {/* Submit Review Form */}
        {user ? (
          <form onSubmit={handleAddReview} className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-white font-bold text-base">Write a Customer Review</h3>

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold">
                {reviewError}
              </div>
            )}
            {reviewSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {reviewSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">Rating Score:</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Below Average</option>
                <option value="1">1 Star - Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">Your Review Comment:</label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your honest opinion about the product build, quality, and performance..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50"
            >
              {reviewSubmitting ? 'Submitting Review...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            Please <Link to="/login" className="text-indigo-400 underline font-bold">Sign In</Link> to leave a review for this product.
          </div>
        )}
      </div>

    </div>
  );
}
