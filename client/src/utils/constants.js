export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_COMPONENTS = [
  'Whole Blood',
  'Packed Red Blood Cells',
  'Plasma',
  'Platelets'
];

export const REQUEST_URGENCY = {
  NORMAL: { label: 'Normal', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  URGENT: { label: 'Urgent', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  EMERGENCY: { label: 'EMERGENCY 🚨', color: 'bg-red-100 text-red-800 border-red-300 animate-pulse font-bold' }
};

export const REQUEST_STATUS = {
  PENDING: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  APPROVED: { label: 'Approved', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
  FULFILLED: { label: 'Fulfilled & Issued', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 border-gray-300' }
};

export const INVENTORY_STATUS = {
  AVAILABLE: { label: 'Available', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  RESERVED: { label: 'Reserved', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  ISSUED: { label: 'Issued', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  EXPIRED: { label: 'Expired', color: 'bg-red-100 text-red-800 border-red-300' },
  DISCARDED: { label: 'Discarded', color: 'bg-gray-100 text-gray-700 border-gray-300' }
};
