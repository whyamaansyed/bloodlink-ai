import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
        <ShieldX className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-900">403 Forbidden Access</h1>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
        You do not have administrative role authorization to access this page or endpoint.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
      >
        Return to Home Page
      </Link>
    </div>
  );
};
