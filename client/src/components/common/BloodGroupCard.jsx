import React from 'react';
import { Droplet } from 'lucide-react';

export const BloodGroupCard = ({ bloodGroup, count = 0, minThreshold = 10 }) => {
  let statusColor = 'bg-emerald-500/10 text-emerald-700 border-emerald-200/60';
  let badgeText = 'Normal';

  if (count <= 3) {
    statusColor = 'bg-red-500/10 text-red-700 border-red-200/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    badgeText = 'Critical';
  } else if (count < minThreshold) {
    statusColor = 'bg-amber-500/10 text-amber-700 border-amber-200/60';
    badgeText = 'Low';
  }

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center justify-between hover:border-blood-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10 flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blood-50 to-white border border-blood-100 flex items-center justify-center text-blood-600 font-black text-xl shadow-sm">
          {bloodGroup}
        </div>
        <div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{count} <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">units</span></p>
          <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${statusColor}`}>
            {badgeText}
          </span>
        </div>
      </div>
      <Droplet className={`relative z-10 w-5 h-5 ${count <= 3 ? 'text-red-500 animate-pulse drop-shadow-md' : 'text-slate-300'}`} />
    </div>
  );
};
