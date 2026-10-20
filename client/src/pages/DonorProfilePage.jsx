import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Droplet, Heart, CheckCircle2, User, Phone, Mail } from 'lucide-react';

export const DonorProfilePage = () => {
  const { user } = useAuth();
  const profile = user?.profile || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-blood-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
          {profile.bloodGroup || 'O+'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Voluntary Blood Donor</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Donor Credentials</h3>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Blood Group</span>
            <span className="font-black text-blood-600 text-base">{profile.bloodGroup || 'O+'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Eligibility Status</span>
            <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {profile.eligibilityStatus || 'ELIGIBLE'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Total Voluntary Donations</span>
            <span className="font-bold text-slate-800 text-sm">{profile.totalDonations || 0} times</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Gender</span>
            <span className="font-bold text-slate-800 text-sm">{profile.gender || 'Not specified'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Email</span>
            <span className="font-bold text-slate-800 text-sm">{user?.email}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Phone</span>
            <span className="font-bold text-slate-800 text-sm">{user?.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
