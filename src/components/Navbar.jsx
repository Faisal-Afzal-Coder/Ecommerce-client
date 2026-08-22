import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  User, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  PackageCheck, 
  UserCheck,
  Edit3,
  Megaphone
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const { storeConfig, activeTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <>
      {/* Dynamic Announcement Top Bar */}
      {storeConfig.showAnnouncement && storeConfig.announcementText && (
        <div className={`break-safe py-2 px-4 text-center text-xs font-semibold tracking-wide ${activeTheme.announcementBg} flex items-center justify-center gap-2 transition-colors duration-300`}>
          <Megaphone className="w-3.5 h-3.5 shrink-0 animate-bounce" />
          <span className="min-w-0">{storeConfig.announcementText}</span>
        </div>
      )}

      <nav className={`sticky top-0 z-50 glass-panel border-b ${activeTheme.border} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center justify-between h-20">
            
            {/* Brand Logo */}
            <Link to="/" className="flex min-w-0 items-center gap-3 group">
              <div className={`w-10 h-10 rounded-xl ${activeTheme.primaryBtn} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className={`min-w-0 truncate text-2xl font-extrabold tracking-tight text-white ${activeTheme.accentHover} transition-colors`}>
                {storeConfig.navbarLogoText || 'LuxeStore'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors hover:text-white ${
                      isActive ? `${activeTheme.accentText} font-bold` : 'text-slate-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Admin Live Customizer Banner Badge */}
              {isAdmin && (
                <Link
                  to="/admin/customize"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${activeTheme.badge} hover:scale-105 transition-all`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Customize Theme</span>
                </Link>
              )}

              {/* Cart Icon */}
              <Link
                to="/checkout"
                className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full ${activeTheme.primaryBtn} text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-pulse`}>
                    {totalCartCount}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium transition-all"
                  >
                    <div className={`w-7 h-7 rounded-lg ${activeTheme.badge} flex items-center justify-center font-bold text-xs`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl py-2 border border-slate-800 z-50"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-800/80">
                        <p className="text-xs text-slate-400">Logged in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${activeTheme.badge}`}>
                          {user.role}
                        </span>
                      </div>

                      {isAdmin ? (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800/60 hover:text-white"
                          >
                            <LayoutDashboard className={`w-4 h-4 ${activeTheme.accentText}`} />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link
                            to="/admin/customize"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800/60 hover:text-white"
                          >
                            <Edit3 className={`w-4 h-4 ${activeTheme.accentText}`} />
                            <span>Theme Customizer</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/my-orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800/60 hover:text-white"
                          >
                            <PackageCheck className={`w-4 h-4 ${activeTheme.accentText}`} />
                            <span>My Orders & Status</span>
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800/60 hover:text-white"
                          >
                            <UserCheck className={`w-4 h-4 ${activeTheme.accentText}`} />
                            <span>Profile & Address</span>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-800/80 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTheme.primaryBtn} transition-all`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <Link to="/checkout" className="relative p-2 text-slate-300">
                <ShoppingBag className="w-6 h-6" />
                {totalCartCount > 0 && (
                  <span className={`absolute top-0 right-0 w-4 h-4 rounded-full ${activeTheme.primaryBtn} text-white text-[10px] font-bold flex items-center justify-center`}>
                    {totalCartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-indigo-400 font-medium"
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <p className="text-xs text-slate-400 font-semibold">{user.name} ({user.role})</p>
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2 ${activeTheme.accentText} font-medium`}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/customize"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-pink-400 font-medium"
                    >
                      Theme Customizer
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/my-orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-slate-200"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-slate-200"
                    >
                      Profile & Shipping Address
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-left py-2 text-rose-400 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-slate-200 bg-slate-900 rounded-xl border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-center py-2 ${activeTheme.primaryBtn} rounded-xl font-medium`}
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
