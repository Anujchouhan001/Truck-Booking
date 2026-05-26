import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 text-white shadow-2xl sticky top-0 z-50 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-[10%] w-1 h-1 bg-white/30 rounded-full animate-ping-slow"></div>
        <div className="absolute top-3 left-[30%] w-0.5 h-0.5 bg-purple-300/40 rounded-full animate-ping-slow" style={{ animationDelay: '-1s' }}></div>
        <div className="absolute top-1 right-[25%] w-1 h-1 bg-pink-300/30 rounded-full animate-ping-slow" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute bottom-2 right-[15%] w-0.5 h-0.5 bg-indigo-300/40 rounded-full animate-ping-slow" style={{ animationDelay: '-0.5s' }}></div>

        {/* Moving truck across navbar - subtle background element */}
        <div className="absolute bottom-1 animate-truck-drive opacity-20">
          <svg className="w-8 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
        </div>
      </div>

      {/* Gradient accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-shift bg-[length:200%_auto]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo with animated effects */}
          <Link to="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
            <div className="relative">
              {/* Glow ring effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 p-2 rounded-xl shadow-lg group-hover:scale-110 transition-all duration-300 overflow-hidden">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10 group-hover:animate-wiggle" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                TruckSuvidha
              </div>
              <div className="text-[10px] text-purple-300 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live • 24/7 Support
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 bg-white/5 backdrop-blur-sm rounded-2xl px-2 py-1 border border-white/10">
            <Link to="/" className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm font-medium">
              Home
            </Link>

            {user?.role === 'admin' || user?.role === 'superadmin' ? (
              <>
                <Link to="/admin/manage-loads" className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-purple-500/20 transition-all duration-300 text-sm font-medium whitespace-nowrap">
                  Manage Loads
                </Link>
                <Link to="/admin/manage-trucks" className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-blue-500/20 transition-all duration-300 text-sm font-medium whitespace-nowrap">
                  Manage Trucks
                </Link>
                <Link to="/admin/manage-users" className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-emerald-500/20 transition-all duration-300 text-sm font-medium whitespace-nowrap">
                  Manage Users
                </Link>
                <Link to="/admin/manage-social-media" className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-pink-500/20 transition-all duration-300 text-sm font-medium whitespace-nowrap">
                  Social
                </Link>
              </>
            ) : (
              <>
                <Link to="/load-board" className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-blue-500/20 transition-all duration-300 text-sm font-medium whitespace-nowrap">
                  Load Board
                </Link>
                <Link to="/truck-board" className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-purple-500/20 transition-all duration-300 text-sm font-medium whitespace-nowrap">
                  Truck Board
                </Link>
                {user && (
                  <Link to="/post-load" className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-emerald-500/20 transition-all duration-300 text-sm font-medium whitespace-nowrap">
                    Post Load
                  </Link>
                )}
              </>
            )}

            <Link to="/contact" className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-orange-500/20 transition-all duration-300 text-sm font-medium">
              Contact
            </Link>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-purple-400 group-hover:border-pink-400 transition"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm text-right">
                    <div className="font-semibold text-white">{user.name || 'User'}</div>
                    <div className="text-xs text-purple-300 capitalize">{user.role}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 text-sm font-medium border border-white/20 hover:border-white/40"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-400 hover:via-pink-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all duration-300 text-sm whitespace-nowrap shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105"
                >
                  Free Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl transition-all duration-300 text-xs sm:text-sm shadow-lg shadow-red-500/25 font-medium"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 text-xs sm:text-sm shadow-lg shadow-orange-500/25"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-white hover:bg-white/10 transition-all duration-300 focus:outline-none border border-white/20"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="bg-gradient-to-b from-slate-900/98 to-purple-900/98 backdrop-blur-md border-t border-purple-500/30">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {user && (
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 mb-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                onClick={closeMobileMenu}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-purple-400"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-lg font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-white">{user.name || 'User'}</div>
                  <div className="text-xs text-purple-300 capitalize">{user.role} • View Profile</div>
                </div>
              </Link>
            )}

            <Link
              to="/"
              className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
              onClick={closeMobileMenu}
            >
              🏠 Home
            </Link>

            {user?.role === 'admin' || user?.role === 'superadmin' ? (
              <>
                <Link
                  to="/admin/manage-loads"
                  className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-purple-500/20 transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  📦 Manage Loads
                </Link>
                <Link
                  to="/admin/manage-trucks"
                  className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-blue-500/20 transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  🚛 Manage Trucks
                </Link>
                <Link
                  to="/admin/manage-users"
                  className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-emerald-500/20 transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  👥 Manage Users
                </Link>
                <Link
                  to="/admin/manage-social-media"
                  className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-pink-500/20 transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  🔗 Social Media
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/load-board"
                  className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-blue-500/20 transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  📋 Load Board
                </Link>
                <Link
                  to="/truck-board"
                  className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-purple-500/20 transition-all duration-300"
                  onClick={closeMobileMenu}
                >
                  🚚 Truck Board
                </Link>
                {user && (
                  <Link
                    to="/post-load"
                    className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-emerald-500/20 transition-all duration-300"
                    onClick={closeMobileMenu}
                  >
                    ➕ Post Load
                  </Link>
                )}
              </>
            )}

            <Link
              to="/contact"
              className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-orange-500/20 transition-all duration-300"
              onClick={closeMobileMenu}
            >
              📞 Contact
            </Link>

            {!user && (
              <div className="pt-3 border-t border-purple-500/30 mt-3">
                <Link
                  to="/register"
                  className="block px-4 py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-semibold rounded-xl text-center transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50"
                  onClick={closeMobileMenu}
                >
                  ✨ Free Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>


    </nav >
  );
}
