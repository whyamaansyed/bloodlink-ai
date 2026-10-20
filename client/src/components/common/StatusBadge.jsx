import React from 'react';
import { REQUEST_STATUS, REQUEST_URGENCY, INVENTORY_STATUS } from '../../utils/constants';

export const StatusBadge = ({ type = 'request', status }) => {
  let config = { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };

  if (type === 'request' && REQUEST_STATUS[status]) {
    config = REQUEST_STATUS[status];
  } else if (type === 'urgency' && REQUEST_URGENCY[status]) {
    config = REQUEST_URGENCY[status];
  } else if (type === 'inventory' && INVENTORY_STATUS[status]) {
    config = INVENTORY_STATUS[status];
  } else if (type === 'stock') {
    if (status === 'ADEQUATE') config = { label: 'Adequate', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (status === 'LOW STOCK') config = { label: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold' };
    if (status === 'CRITICAL') config = { label: 'CRITICAL', color: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse' };
  } else if (type === 'expiry') {
    if (status === 'EXPIRED') config = { label: 'EXPIRED', color: 'bg-red-100 text-red-800 border-red-300 font-bold' };
    if (status === 'CRITICAL') config = { label: 'Expiring (1-3d)', color: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold' };
    if (status === 'WARNING') config = { label: 'Warning (4-7d)', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    if (status === 'NORMAL') config = { label: 'Normal (>7d)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};
