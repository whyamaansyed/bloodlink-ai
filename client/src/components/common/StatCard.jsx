import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, onClick }) => {
  const colorSchemes = {
    blue: 'bg-gradient-to-br from-blue-50/80 to-blue-100/30 text-blue-600 border-blue-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]',
    red: 'bg-gradient-to-br from-red-50/80 to-red-100/30 text-blood-600 border-red-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]',
    emerald: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 text-emerald-600 border-emerald-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]',
    amber: 'bg-gradient-to-br from-amber-50/80 to-amber-100/30 text-amber-600 border-amber-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]',
    purple: 'bg-gradient-to-br from-purple-50/80 to-purple-100/30 text-purple-600 border-purple-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]',
    rose: 'bg-gradient-to-br from-rose-50/80 to-rose-100/30 text-rose-600 border-rose-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
  };

  const iconColors = {
    blue: 'bg-blue-100/50 text-blue-600',
    red: 'bg-red-100/50 text-blood-600',
    emerald: 'bg-emerald-100/50 text-emerald-600',
    amber: 'bg-amber-100/50 text-amber-600',
    purple: 'bg-purple-100/50 text-purple-600',
    rose: 'bg-rose-100/50 text-rose-600'
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 border backdrop-blur-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''} ${colorSchemes[color] || colorSchemes.blue}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500/80">{title}</p>
          <p className="text-3xl font-black text-slate-800 mt-1.5 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl ${iconColors[color] || iconColors.blue}`}>
            <Icon className="w-6 h-6 stroke-[2.5]" />
          </div>
        )}
      </div>
    </div>
  );
};
