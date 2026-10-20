import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden bg-slate-50">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blood-50/50 via-white to-blue-50/50"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blood-400/20 rounded-full blur-3xl mix-blend-multiply animate-blob pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 group mb-8 hover:scale-105 transition-transform duration-300">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 flex items-center justify-center text-white shadow-lg shadow-blood-200/50 ring-4 ring-white/50">
            <Droplet className="w-8 h-8 fill-current" />
          </div>
          <div className="text-left">
            <span className="font-black text-2xl text-slate-900 tracking-tight block leading-none drop-shadow-sm">
              BLOODLINK <span className="text-transparent bg-clip-text bg-gradient-to-r from-blood-600 to-red-500">AI</span>
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mt-1.5">
              Smart Blood Bank Management System
            </span>
          </div>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 sm:rounded-3xl sm:px-12 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
