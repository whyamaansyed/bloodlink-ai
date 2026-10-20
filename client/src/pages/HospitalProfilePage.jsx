import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export const HospitalProfilePage = () => {
  const { user } = useAuth();
  const profile = user?.profile || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
          <Building2 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{profile.hospitalName || user?.name}</h1>
          <p className="text-xs text-slate-500 font-semibold">Reg #: {profile.registrationNumber || 'REG-HOSP-001'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Facility Credentials</h3>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Contact Person</span>
            <span className="font-bold text-slate-800 text-sm">{profile.contactPerson || user?.name}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">City</span>
            <span className="font-bold text-slate-800 text-sm">{profile.city || 'Metropolis'}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Phone</span>
            <span className="font-bold text-slate-800 text-sm">{profile.phone || user?.phone}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Emergency Dispatch Contact</span>
            <span className="font-bold text-blood-600 text-sm">{profile.emergencyContact || profile.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
