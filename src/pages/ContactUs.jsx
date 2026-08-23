import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function ContactUs() {
  const { storeConfig, activeTheme } = useStore();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'Order & Product Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill from logged-in user account
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitted(false);

    if (!form.name || !form.email || !form.message) {
      setErrorMsg('Please provide your name, email address, and message.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/store/contact', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message
      });

      setLoading(false);
      setSubmitted(true);
      setForm((prev) => ({
        ...prev,
        message: ''
      }));
      toast.success(res.data.message || 'Your message has been sent successfully.');
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Failed to send message. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-300 py-12 px-4 max-w-5xl mx-auto space-y-8 animate-fade-in`}>
      
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Customer Support Center</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Get in Touch with Us
        </h1>
        <p className="text-slate-400 text-sm">
          Have questions about your order, shipping, or products? Our support team is here to assist you 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Contact Channels</span>
            </h3>
            
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Direct Support Email</p>
                  <p className="font-semibold text-white font-mono text-xs sm:text-sm">{storeConfig.contactEmail || 'educatedboy610@gmail.com'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Customer Helpline</p>
                  <p className="font-semibold text-white">{storeConfig.contactPhone || '+92 300 1234567'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Store Office</p>
                  <p className="font-semibold text-white">LuxeStore Headquarters, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Response Time</span>
            </div>
            <p>Our team usually responds to emails within <strong>1–2 hours</strong> during business hours.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl relative">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Send Us a Message</h3>
            {user ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Account</span>
              </span>
            ) : null}
          </div>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Message Delivered!</p>
                <p className="text-slate-300 mt-0.5">
                  Your inquiry has been emailed directly to our customer care desk (educatedboy610@gmail.com). We will reply to your account email shortly.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-400 font-semibold">Email Address</label>
                {user && (
                  <span className="text-[10px] text-indigo-400 font-mono">
                    (Linked to your account)
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  readOnly={Boolean(user)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 ${
                    user ? 'bg-slate-950 text-indigo-300 font-mono cursor-not-allowed border-slate-700/60' : ''
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Order & Tracking Status">Order & Tracking Status</option>
                <option value="Payment & Verification Inquiry">Payment & Verification Inquiry</option>
                <option value="Product Details & Stock">Product Details & Stock</option>
                <option value="Returns & Refunds">Returns & Refunds</option>
                <option value="General Support">General Support</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Your Message</label>
              <textarea
                rows="4"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your question or issue in detail..."
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl ${activeTheme.primaryBtn} text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all`}
            >
              {loading ? (
                <span>Sending Message...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message to Support</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
