import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Trash2, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  PackageCheck
} from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartSubtotal, clearCart } = useCart();
  const { activeTheme } = useStore();
  const navigate = useNavigate();

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.shippingAddress?.phone || '',
    street: user?.shippingAddress?.street || '',
    city: user?.shippingAddress?.city || '',
    postalCode: user?.shippingAddress?.postalCode || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'ONLINE'
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expDate: '12/28',
    cvv: '888'
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const subtotal = getCartSubtotal();
  const shippingFee = paymentMethod === 'COD' ? 100 : 0;
  const totalPrice = subtotal + shippingFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your shopping cart is empty');
      return;
    }

    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city) {
      setErrorMessage('Please fill in all shipping detail fields');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image
        })),
        shippingAddress,
        paymentMethod
      };

      const res = await axios.post('/api/orders', orderPayload);
      setPlacedOrder(res.data);
      clearCart();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to process order');
    } finally {
      setLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <div className={`min-h-screen ${activeTheme.bg} py-16 px-4 max-w-3xl mx-auto text-center space-y-8`}>
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">Order Confirmed!</h1>
            <p className="text-slate-300 text-sm">
              Thank you for your purchase! Order ID: <span className="font-mono text-indigo-400 font-bold">{placedOrder._id}</span>
            </p>
          </div>

          {/* Receipt Breakdown */}
          <div className="p-6 glass-card rounded-2xl border border-slate-800 text-left space-y-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Items Total:</span>
              <span className="text-white font-bold">${placedOrder.itemsPrice}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Delivery Fee ({placedOrder.paymentMethod}):</span>
              <span className={placedOrder.paymentMethod === 'COD' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {placedOrder.paymentMethod === 'COD' ? '+ $100 COD Delivery Fee' : 'Free Online Delivery'}
              </span>
            </div>
            <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-slate-800">
              <span>Total Price Paid/Due:</span>
              <span className="text-indigo-400">${placedOrder.totalPrice}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/my-orders"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Track Order Progress</span>
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 rounded-xl font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-12 px-4 max-w-7xl mx-auto space-y-8`}>
      
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Shopping Cart & Checkout
        </h1>
        <p className="text-slate-400 text-sm">
          Review your items, provide shipping details, and select your preferred payment method.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center space-y-6">
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
          <p className="text-slate-400 text-sm">Looks like you haven't added any products to your cart yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: CART ITEMS & SHIPPING FORM (8 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Cart Items List */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center justify-between">
                <span>Selected Products ({cartItems.length})</span>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-indigo-400 font-semibold">${item.price} each</p>
                    </div>

                    <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product, item.qty - 1)}
                        className="px-2.5 py-1 text-slate-300 font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-white">{item.qty}</span>
                      <button
                        onClick={() => updateQuantity(item.product, item.qty + 1)}
                        className="px-2.5 py-1 text-slate-300 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-white">${item.price * item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Details Form */}
            <form onSubmit={handlePlaceOrder} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <span>Shipping Details</span>
              </h2>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    placeholder="House / Apartment #, Street Name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="City Name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    placeholder="Postal / Zip Code"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-pink-400" />
                  <span>Select Payment Method</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* COD OPTION (Adds +100 delivery fee) */}
                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">Cash on Delivery (COD)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        + $100 Delivery Fee
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Pay cash at your doorstep upon receiving package. Delivery surcharge of $100 will be added.
                    </p>
                  </label>

                  {/* ONLINE PAYMENT OPTION (Free Delivery / Exact Subtotal) */}
                  <label
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">Online Credit / Debit Card</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Free Shipping ($0)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Pay online instantly with credit/debit card. Exact product subtotal without extra fee.
                    </p>
                  </label>

                </div>

                {/* Simulated Online Card Fields */}
                {paymentMethod === 'ONLINE' && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
                    <p className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Encrypted Instant Card Checkout</span>
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={cardDetails.expDate}
                          onChange={(e) => setCardDetails({ ...cardDetails, expDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl ${activeTheme.primaryBtn} text-white font-bold text-base shadow-xl hover:scale-101 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                <span>{loading ? 'Processing Order...' : `Confirm & Complete Order ($${totalPrice})`}</span>
              </button>

            </form>

          </div>

          {/* RIGHT: ORDER SUMMARY CARD (5 Cols) */}
          <div className="lg:col-span-5">
            <div className={`glass-panel p-6 sm:p-8 rounded-3xl ${activeTheme.border} space-y-6 sticky top-28`}>
              <h3 className="text-xl font-bold text-white">Order Summary</h3>

              <div className="space-y-3 text-sm border-b border-slate-800 pb-4">
                <div className="flex justify-between text-slate-400">
                  <span>Product Subtotal:</span>
                  <span className="text-white font-bold">${subtotal}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Payment Method:</span>
                  <span className={`${activeTheme.accentText} font-bold`}>{paymentMethod}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Shipping & Handling:</span>
                  <span className={paymentMethod === 'COD' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {paymentMethod === 'COD' ? '+ $100 (COD Delivery)' : 'FREE ($0)'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-black text-white">
                <span>Total Amount:</span>
                <span className={activeTheme.gradientText}>${totalPrice}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Buyer Protection Guaranteed</span>
                </div>
                <p>Orders are backed by 100% money-back guarantee and live status tracking.</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
