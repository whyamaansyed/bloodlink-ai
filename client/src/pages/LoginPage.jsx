import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Building2, UserCheck, KeyRound, Mail, AlertCircle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

const getLoginError = (err) => {
  if (!err.response) {
    return 'Unable to connect to the server. Please make sure the backend is running.';
  }
  if (err.response.status === 401) {
    return 'Invalid email or password.';
  }
  return err.response.data?.message || 'Failed to sign in. Please check credentials.';
};

export const LoginPage = () => {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If session is restored or user already authenticated, redirect to appropriate role dashboard
  if (!authLoading && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'HOSPITAL') return <Navigate to="/hospital/dashboard" replace />;
    return <Navigate to="/donor/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const authenticatedUser = await login(email, password);
      if (authenticatedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (authenticatedUser.role === 'HOSPITAL') navigate('/hospital/dashboard');
      else navigate('/donor/dashboard');
    } catch (err) {
      setError(getLoginError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-center text-2xl font-black tracking-tight text-slate-900">Sign in to BLOODLINK AI</h2>
        <p className="mt-1 text-center text-xs font-medium text-slate-500">Smart Blood Bank Management System</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@bloodlink.ai"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blood-500 focus:border-blood-500 text-slate-800"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blood-500 focus:border-blood-500 text-slate-800"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || authLoading}
          className="w-full py-3.5 bg-gradient-to-r from-blood-600 to-blood-500 hover:from-blood-500 hover:to-blood-400 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_8px_20px_rgb(239,68,68,0.25)] hover:shadow-[0_12px_25px_rgb(239,68,68,0.35)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {submitting ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* Collapsible Demo Accounts */}
      <div className="pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-700 py-1 transition-colors"
        >
          <span className="uppercase tracking-wider">Demo Accounts</span>
          {showDemoAccounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDemoAccounts && (
          <div className="mt-3 space-y-2 animate-fade-in">
            {/* Admin */}
            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-900">Admin</p>
                  <p className="text-[11px] font-mono text-purple-700">admin@bloodlink.ai</p>
                  <p className="text-[10px] font-mono text-slate-400">Password: Admin@123</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUseDemo('admin@bloodlink.ai', 'Admin@123')}
                className="px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Use
              </button>
            </div>

            {/* Hospital */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900">Hospital</p>
                  <p className="text-[11px] font-mono text-blue-700">hospital@bloodlink.ai</p>
                  <p className="text-[10px] font-mono text-slate-400">Password: Hospital@123</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUseDemo('hospital@bloodlink.ai', 'Hospital@123')}
                className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Use
              </button>
            </div>

            {/* Donor */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Donor</p>
                  <p className="text-[11px] font-mono text-emerald-700">donor@bloodlink.ai</p>
                  <p className="text-[10px] font-mono text-slate-400">Password: Donor@123</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUseDemo('donor@bloodlink.ai', 'Donor@123')}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Use
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-500 pt-1">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-blood-600 hover:underline">
          Register now
        </Link>
      </p>
    </div>
  );
};
