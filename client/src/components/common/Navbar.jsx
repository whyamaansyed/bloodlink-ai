import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Droplet, LogOut, User as UserIcon, Menu, X, ShieldAlert, Building2, UserCheck } from 'lucide-react';

export const Navbar = ({ onMobileToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-md border border-purple-200"><ShieldAlert className="w-3 h-3"/><span>ADMIN</span></span>;
      case 'HOSPITAL':
        return <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md border border-blue-200"><Building2 className="w-3 h-3"/><span>HOSPITAL</span></span>;
      case 'DONOR':
        return <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200"><UserCheck className="w-3 h-3"/><span>DONOR</span></span>;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 p-4 transition-all duration-300">
      <div className="w-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Brand Logo & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          {user && (
            <button
              onClick={onMobileToggle}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <Link to="/" className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-300">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 flex items-center justify-center text-white shadow-lg shadow-blood-200/50 ring-2 ring-white/50">
              <Droplet className="w-6 h-6 fill-current animate-pulse-glow" />
            </div>
            <div>
              <span className="font-black text-xl text-slate-900 tracking-tight block leading-none">
                BLOODLINK <span className="text-transparent bg-clip-text bg-gradient-to-r from-blood-600 to-red-500">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                Smart Blood Bank Management System
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <NotificationBell />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2.5 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors shadow-sm bg-white"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 text-white font-black flex items-center justify-center text-sm shadow-md ring-2 ring-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left pr-2">
                    <p className="text-xs font-black text-slate-800 leading-none">{user.name}</p>
                    <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={user.role === 'ADMIN' ? '/admin/profile' : user.role === 'HOSPITAL' ? '/hospital/profile' : '/donor/profile'}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-blood-600 hover:bg-blood-50 transition-colors text-left border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4 text-blood-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold bg-blood-600 hover:bg-blood-700 text-white rounded-lg shadow-sm transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
