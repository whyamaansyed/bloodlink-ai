import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, ShieldCheck, MapPin } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-blood-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{user?.role} Account Profile</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Account Details</h3>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Full Name</span>
            <span className="font-bold text-slate-800 text-sm">{user?.name}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Email Address</span>
            <span className="font-bold text-slate-800 text-sm">{user?.email}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Phone Number</span>
            <span className="font-bold text-slate-800 text-sm">{user?.phone}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Role</span>
            <span className="font-bold text-blood-600 text-sm">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
