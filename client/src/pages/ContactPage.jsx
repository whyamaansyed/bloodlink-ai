import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const ContactPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Contact Blood Bank Operations</h1>
        <p className="text-slate-500 text-sm">24/7 Emergency Blood Dispatch & Support Desk</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-50 text-blood-600 rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">24/7 Emergency Hotline</h4>
              <p className="text-xs text-slate-500">+1 (800) 555-BLOOD (25663)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Dispatch Email</h4>
              <p className="text-xs text-slate-500">dispatch@bloodbank.org</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Central Repository</h4>
              <p className="text-xs text-slate-500">100 Medical Center Blvd, Metropolis, NY 10001</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-3">
          <h3 className="font-bold text-slate-800 text-base">Hospital Dispatch Hours</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Emergency requests submitted with <strong>EMERGENCY</strong> urgency bypass standard queueing and notify on-call hematology staff instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
