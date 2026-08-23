import React, { useState, useEffect } from 'react';
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
  PackageCheck,
  Upload,
  Building2,
  Smartphone,
  Info,
  Sparkles,
  Clock
} from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartSubtotal, clearCart } = useCart();
  const { activeTheme } = useStore();
  const navigate = useNavigate();

  // Cities List for Shipping Calculation
  const [availableCities, setAvailableCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.shippingAddress?.phone || '',
    street: user?.shippingAddress?.street || '',
    city: user?.shippingAddress?.city || 'Karachi',
    postalCode: user?.shippingAddress?.postalCode || ''
  });

  const [shippingInfo, setShippingInfo] = useState({
    shippingFee: 150,
    estimatedDays: '2-4 Business Days',
    ruleUsed: 'Standard'
  });
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // Payment Method: 'COD', 'BANK_TRANSFER', 'EASYPAISA', 'JAZZCASH'
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentSubmittedMsg, setPaymentSubmittedMsg] = useState('');

  const subtotal = getCartSubtotal();
  const shippingFee = shippingInfo.shippingFee;
  const totalPrice = subtotal + shippingFee;

  // Fetch Cities on Mount
  useEffect(() => {
    fetchShippingCities();
  }, []);

  // Recalculate shipping whenever city or subtotal changes
  useEffect(() => {
    if (shippingAddress.city && cartItems.length > 0) {
      calculateShipping(shippingAddress.city, subtotal);
    }
  }, [shippingAddress.city, subtotal, cartItems.length]);

  const fetchShippingCities = async () => {
    setLoadingCities(true);
    try {
      const res = await axios.get('/api/shipping/cities');
      setAvailableCities(res.data);
      if (res.data.length > 0 && !shippingAddress.city) {
        setShippingAddress((prev) => ({ ...prev, city: res.data[0].city }));
      }
    } catch (error) {
      console.error('Error loading shipping destinations:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const calculateShipping = async (city, currentSubtotal) => {
    setCalculatingShipping(true);
    try {
      const totalWeight = cartItems.reduce((acc, item) => acc + (item.qty * 0.5), 0);
      const res = await axios.post('/api/shipping/calculate', {
        city,
        totalWeight,
        subtotal: currentSubtotal
      });
      setShippingInfo({
        shippingFee: res.data.shippingFee,
        estimatedDays: res.data.estimatedDays,
        ruleUsed: res.data.ruleUsed
      });
    } catch (error) {
      console.error('Error calculating shipping:', error);
    } finally {
      setCalculatingShipping(false);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setErrorMessage('');
  };

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
      setErrorMessage('Please fill in all shipping detail fields including city and contact number');
      return;
    }

    // Require screenshot for manual bank/wallet transfer
    const isManualTransfer = ['BANK_TRANSFER', 'EASYPAISA', 'JAZZCASH'].includes(paymentMethod);
    if (isManualTransfer && !screenshotFile) {
      setErrorMessage('Please upload your transaction payment screenshot before placing order.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      let uploadedScreenshotUrl = '';

      // Step 1: Upload Screenshot if manual transfer
      if (isManualTransfer && screenshotFile) {
        setUploadingScreenshot(true);
        const formData = new FormData();
        formData.append('screenshot', screenshotFile);
        const uploadRes = await axios.post('/api/payments/upload-proof', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedScreenshotUrl = uploadRes.data.screenshotUrl;
        setUploadingScreenshot(false);
      }

      // Step 2: Create Order
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

      const orderRes = await axios.post('/api/orders', orderPayload);
      const createdOrder = orderRes.data;

      // Step 3: Attach Payment Proof & Trigger Gemini AI Verification
      if (isManualTransfer && uploadedScreenshotUrl) {
        const paymentRes = await axios.post('/api/payments/submit', {
          orderId: createdOrder._id,
          screenshotUrl: uploadedScreenshotUrl,
          transactionId,
          paymentMethod
        });
        setPaymentSubmittedMsg(paymentRes.data.message);
      }

      setPlacedOrder(createdOrder);
      clearCart();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
      setUploadingScreenshot(false);
    }
  };

  if (placedOrder) {
    const isManual = ['BANK_TRANSFER', 'EASYPAISA', 'JAZZCASH'].includes(placedOrder.paymentMethod);

    return (
      <div className={`min-h-screen ${activeTheme.bg} py-16 px-4 max-w-3xl mx-auto text-center space-y-8`}>
        <div className="glass-panel p-8 sm:p-14 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-6 animate-fade-in">
          
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">Order Confirmed!</h1>
            <p className="text-slate-300 text-sm">
              Thank you for your purchase! Order ID: <span className="font-mono text-indigo-400 font-bold">{placedOrder._id}</span>
            </p>
          </div>

          {/* Payment Status Notification Card */}
          {isManual ? (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs text-left space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <Clock className="w-4 h-4" />
                <span>Payment Status: VERIFYING</span>
              </div>
              <p className="text-slate-300">
                {paymentSubmittedMsg || 'Your payment proof has been submitted for AI and administrator verification. Your payment may remain pending for up to 24 hours while being verified.'}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Truck className="w-4 h-4" />
                <span>Payment Method: Cash on Delivery (COD)</span>
              </div>
              <p className="text-slate-300">
                Your order is confirmed and will be dispatched to your shipping address. Please keep exact cash ready upon delivery.
              </p>
            </div>
          )}

          {/* Receipt Breakdown */}
          <div className="p-6 glass-card rounded-2xl border border-slate-800 text-left space-y-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Items Total:</span>
              <span className="text-white font-bold">${placedOrder.itemsPrice}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping ({placedOrder.shippingAddress?.city}):</span>
              <span className="text-white font-bold">${placedOrder.shippingFee}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Mode:</span>
              <span className="text-indigo-400 font-bold">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-slate-800">
              <span>Total Price Paid/Due:</span>
              <span className="text-indigo-400 font-mono">${placedOrder.totalPrice}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/my-orders"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Track Live Order Status</span>
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
                        className="px-2.5 py-1 text-slate-300 font-bold hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-white">{item.qty}</span>
                      <button
                        onClick={() => updateQuantity(item.product, item.qty + 1)}
                        className="px-2.5 py-1 text-slate-300 font-bold hover:text-white"
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  <span>Shipping Details</span>
                </h2>
                {calculatingShipping && (
                  <span className="text-xs text-indigo-400 animate-pulse font-semibold">
                    Calculating shipping rates...
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
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
                    placeholder="+92 300 0000000"
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
                    placeholder="House / Apartment #, Street Name, Area"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Destination City</label>
                  <select
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {availableCities.length > 0 ? (
                      availableCities.map((c) => (
                        <option key={c._id || c.city} value={c.city}>
                          {c.city} ({c.province || 'Standard'}) - ${c.baseRate} Delivery
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Karachi">Karachi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Other Nationwide">Other Nationwide</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Postal Code (Optional)</label>
                  <input
                    type="text"
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
                  
                  {/* COD OPTION */}
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
                        Doorstep Cash
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Pay cash upon package arrival at your doorstep. Standard carrier fee applies.
                    </p>
                  </label>

                  {/* BANK TRANSFER */}
                  <label
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-400" /> Bank Transfer / Raast
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        AI Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Transfer directly via Online Banking / Raast ID and upload receipt.
                    </p>
                  </label>

                  {/* EASYPAISA */}
                  <label
                    onClick={() => setPaymentMethod('EASYPAISA')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'EASYPAISA'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-400" /> Easypaisa Mobile Wallet
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Instant Proof
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Send to Easypaisa account and upload screenshot.
                    </p>
                  </label>

                  {/* JAZZCASH */}
                  <label
                    onClick={() => setPaymentMethod('JAZZCASH')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'JAZZCASH'
                        ? 'bg-rose-500/10 border-rose-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-rose-400" /> JazzCash Mobile Wallet
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Instant Proof
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Send to JazzCash account and upload screenshot.
                    </p>
                  </label>

                </div>

                {/* MANUAL PAYMENT INSTRUCTIONS & SCREENSHOT UPLOAD FORM */}
                {['BANK_TRANSFER', 'EASYPAISA', 'JAZZCASH'].includes(paymentMethod) && (
                  <div className="p-5 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-4 text-xs">
                    
                    {/* Bank / Wallet Account Details Card */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold">
                        <Info className="w-4 h-4" />
                        <span>Official Payment Account Details:</span>
                      </div>
                      
                      {paymentMethod === 'BANK_TRANSFER' && (
                        <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                          <p>• Bank: <strong className="text-white">Meezan Bank Limited</strong></p>
                          <p>• Account Title: <strong className="text-white">LuxeStore Official</strong></p>
                          <p>• Account Number: <strong className="text-indigo-300">01020304050607</strong></p>
                          <p>• IBAN: <strong className="text-indigo-300">PK00MEZN0001234567890123</strong></p>
                          <p>• Raast ID: <strong className="text-emerald-400">03001234567</strong></p>
                        </div>
                      )}

                      {paymentMethod === 'EASYPAISA' && (
                        <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                          <p>• Account Type: <strong className="text-white">Easypaisa Mobile Account</strong></p>
                          <p>• Account Title: <strong className="text-white">LuxeStore Official</strong></p>
                          <p>• Mobile Number: <strong className="text-emerald-400">0300-1234567</strong></p>
                        </div>
                      )}

                      {paymentMethod === 'JAZZCASH' && (
                        <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                          <p>• Account Type: <strong className="text-white">JazzCash Mobile Account</strong></p>
                          <p>• Account Title: <strong className="text-white">LuxeStore Official</strong></p>
                          <p>• Mobile Number: <strong className="text-rose-400">0300-1234567</strong></p>
                        </div>
                      )}

                      <p className="text-[11px] text-amber-300 font-semibold pt-1">
                        ⚠️ Please transfer the exact total amount: <strong>${totalPrice}</strong> and upload screenshot below.
                      </p>
                    </div>

                    {/* Transaction ID & Screenshot Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          Transaction ID / Ref # (Optional)
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. TID-98234123"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          Upload Payment Screenshot (Required)
                        </label>
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-indigo-500 text-slate-300 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4 text-indigo-400" />
                          <span className="truncate">
                            {screenshotFile ? screenshotFile.name : 'Choose Screenshot Image'}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleScreenshotChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Screenshot Preview */}
                    {screenshotPreview && (
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                        <img
                          src={screenshotPreview}
                          alt="Receipt Preview"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold truncate text-xs">Receipt Screenshot Selected</p>
                          <p className="text-[11px] text-slate-400">
                            Multimodal AI will inspect amount and transaction details.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              <button
                type="submit"
                disabled={loading || calculatingShipping}
                className={`w-full py-4 rounded-2xl ${activeTheme.primaryBtn} text-white font-bold text-base shadow-xl hover:scale-101 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{uploadingScreenshot ? 'Uploading Payment Proof...' : 'Securing Order...'}</span>
                  </div>
                ) : (
                  <span>Confirm & Complete Order (${totalPrice})</span>
                )}
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
                  <span>Shipping ({shippingAddress.city}):</span>
                  <span className="text-white font-bold">${shippingInfo.shippingFee}</span>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Estimated Delivery:</span>
                  <span>{shippingInfo.estimatedDays}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-black text-white">
                <span>Total Amount:</span>
                <span className={activeTheme.gradientText}>${totalPrice}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Buyer Protection & AI Security</span>
                </div>
                <p>All manual payments are analyzed by Google Gemini Vision and certified by store managers before dispatch.</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
