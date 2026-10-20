import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-900">404 Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-6">
        The route or resource you are trying to view does not exist.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl"
      >
        Go Back Home
      </Link>
    </div>
  );
};
