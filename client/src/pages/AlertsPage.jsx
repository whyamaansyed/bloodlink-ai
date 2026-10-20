import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDate } from '../utils/formatters';
import { AlertTriangle, Clock, Droplet } from 'lucide-react';

export const AlertsPage = () => {
  const [expiringUnits, setExpiringUnits] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const [expRes, lowRes] = await Promise.all([
          api.get('/inventory/expiring'),
          api.get('/inventory/low-stock')
        ]);
        if (expRes.data.success) setExpiringUnits(expRes.data.expiringUnits);
        if (lowRes.data.success) setLowStockAlerts(lowRes.data.alerts);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) return <LoadingSpinner text="Sweeping inventory and fetching critical alerts..." />;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Critical Inventory & Expiry Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for units approaching expiration and blood groups below minimum threshold</p>
        </div>
      </div>

      {/* Expiring Soon Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2 text-rose-600">
          <Clock className="w-5 h-5" />
          <span>Expiring Soon (Within 7 Days)</span>
        </h2>

        {expiringUnits.length === 0 ? (
          <p className="text-xs text-slate-400 p-6 text-center bg-slate-50 rounded-xl">No blood units are currently approaching expiration.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Unit ID</th>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Component</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Days Remaining</th>
                  <th className="px-4 py-3">Expiry Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringUnits.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 font-medium">
                    <td className="px-4 py-3 font-mono font-bold">{u.unitId}</td>
                    <td className="px-4 py-3 font-bold text-blood-600">{u.bloodGroup}</td>
                    <td className="px-4 py-3">{u.component}</td>
                    <td className="px-4 py-3 font-bold">{u.quantity}</td>
                    <td className="px-4 py-3 text-slate-800">{formatDate(u.expiryDate)}</td>
                    <td className="px-4 py-3 font-bold text-rose-600">{u.daysRemaining} day(s)</td>
                    <td className="px-4 py-3"><StatusBadge type="expiry" status={u.expiryCategory} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2 text-amber-600">
          <AlertTriangle className="w-5 h-5" />
          <span>Low Stock & Critical Stock Alerts</span>
        </h2>

        {lowStockAlerts.length === 0 ? (
          <p className="text-xs text-slate-400 p-6 text-center bg-slate-50 rounded-xl">All blood group stock levels are ADEQUATE.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {lowStockAlerts.map((item, idx) => (
              <div key={idx} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{item.bloodGroup} - {item.component}</h4>
                  <p className="text-xs text-slate-600 mt-1">Available: <strong>{item.currentStock} units</strong> (Min required: {item.minimumStock})</p>
                </div>
                <StatusBadge type="stock" status={item.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
