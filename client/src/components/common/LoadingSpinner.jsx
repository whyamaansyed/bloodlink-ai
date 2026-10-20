import React from 'react';

export const LoadingSpinner = ({ size = 'medium', text = 'Loading data...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <div className={`${sizeClasses[size]} border-slate-200 border-t-blood-600 rounded-full animate-spin mb-3`}></div>
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );
};
