import React from 'react';
import { ShieldCheck, Server, Database, CheckCircle2, Droplet, FileText, Activity } from 'lucide-react';

const HT03_FEATURES_MATRIX = [
  { id: 1, name: 'Real-time blood inventory dashboard', implementation: 'Dynamic calculations direct from active non-expired database records (inventoryService.js)' },
  { id: 2, name: 'Blood-group-wise stock tracking', implementation: 'Matrix display across all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-) & 4 components' },
  { id: 3, name: 'Donation and donor management', implementation: 'Full voluntary donor directory, eligibility tracking, and donor donation workflow (Donation.js)' },
  { id: 4, name: 'Blood unit expiry-date monitoring', implementation: 'FEFO sweep calculating daysUntilExpiry, categorizing Expired, Critical, Warning, Normal (expiryService.js)' },
  { id: 5, name: 'Automatic alerts for low-stock and near-expiry units', implementation: 'Configurable StockThreshold evaluation triggering instant system notifications' },
  { id: 6, name: 'Hospital/blood request management', implementation: 'Multi-stage lifecycle (PENDING ➔ APPROVED / REJECTED ➔ FULFILLED) (BloodRequest.js)' },
  { id: 7, name: 'Emergency blood requirement registration', implementation: 'EMERGENCY 🚨 urgency tag with priority queue ranking and visual highlight' },
  { id: 8, name: 'Intelligent matching of requests with available compatible units', implementation: 'matchingService.js evaluating RBC/Plasma compatibility matrix against inventory' },
  { id: 9, name: 'Nearby blood-bank discovery', implementation: 'Dedicated Discovery page (/nearby-blood-banks) with location, distance calculation, & hotline' },
  { id: 10, name: 'Emergency donor notification system', implementation: 'Automatic broadcast of system notifications to eligible matching donors when emergency requests occur' },
  { id: 11, name: 'Request priority management', implementation: 'Priority Queue Ranking score (urgencyWeight + hoursPending * 2)' },
  { id: 12, name: 'Blood unit movement and transaction history', implementation: 'BloodUnitTransaction audit trail recording DONATED ➔ AVAILABLE ➔ RESERVED ➔ ISSUED' },
  { id: 13, name: 'Admin dashboard with demand and inventory analytics', implementation: 'Recharts analytics suite with 5 interactive multi-dimensional charts' },
  { id: 14, name: 'Reports for high-demand blood groups and shortage trends', implementation: 'Audit reports with date range filtering, print-friendly layouts, and CSV export' }
];

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-black text-blood-600 uppercase tracking-widest bg-blood-50 px-3 py-1 rounded-full border border-blood-200">
          HT-03 Project Specifications
        </span>
        <h1 className="text-3xl font-black text-slate-900">About BLOODLINK AI</h1>
        <p className="text-slate-500 text-xs font-medium max-w-xl mx-auto">
          HT-03 Smart Blood Bank Demand & Inventory Management System — Full-Stack MERN Architecture
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-blood-600" />
          <span>HT-03 Requirements & Implementation Matrix</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Blood banks need to maintain sufficient supplies of different blood groups while managing donations, available units, expiry dates, hospital requests, and emergency requirements. BLOODLINK AI provides real-time visibility and intelligent coordination.
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Feature #</th>
                <th className="px-4 py-3">HT-03 Key Feature</th>
                <th className="px-4 py-3">Implementation & Technical Details</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {HT03_FEATURES_MATRIX.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">#{item.id}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.implementation}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>FULL</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Backend Services</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">Node.js + Express.js REST API with JWT authentication, role authorization, and modular domain services.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Layer</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">MongoDB + Mongoose schemas for Users, Donors, Donations, BloodInventory, BloodRequests, and Transactions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
