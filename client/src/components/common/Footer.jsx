import React from 'react';
import { Droplet, Heart, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-blood-600 text-white flex items-center justify-center font-bold">
            <Droplet className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-bold text-slate-800">SMART BLOOD BANK System</span>
          <span>© 2026 Academic MERN Application</span>
        </div>

        <div className="flex items-center space-x-6 text-slate-500 font-medium">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Medically Validated Workflows</span>
          </span>
          <span className="flex items-center space-x-1">
            <Heart className="w-3.5 h-3.5 text-blood-500" />
            <span>Saving Lives Every Day</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
