import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { BloodGroupCard } from '../components/common/BloodGroupCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { BLOOD_GROUPS } from '../utils/constants';
import {
  Users,
  Building2,
  Boxes,
  FileText,
  AlertTriangle,
  Clock,
  TrendingUp,
  Droplet,
  CheckCircle,
  Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [demandTrends, setDemandTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, demandRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/demand/trends')
        ]);

        if (dashRes.data.success) {
          setData(dashRes.data);
        }
        if (demandRes.data.success) {
          setDemandTrends(demandRes.data.monthlyTrends || []);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading Admin Operational Dashboard..." />;

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Operations Control Center</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time dynamic stock metrics, fulfillment queues, and demand tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/inventory')}
            className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Blood Unit</span>
          </button>
        </div>
      </div>

      {/* Top 7 KPI Cards */}
      <div className="grid-auto-fit-cards gap-4">
        <StatCard title="Donors" value={kpis.totalDonors || 0} icon={Users} color="purple" onClick={() => navigate('/admin/donors')} />
        <StatCard title="Hospitals" value={kpis.totalHospitals || 0} icon={Building2} color="blue" onClick={() => navigate('/admin/hospitals')} />
        <StatCard title="Avail. Units" value={kpis.availableBloodUnits || 0} icon={Boxes} color="emerald" onClick={() => navigate('/admin/inventory')} />
        <StatCard title="Pending Req." value={kpis.pendingRequests || 0} icon={FileText} color="amber" onClick={() => navigate('/admin/requests')} />
        <StatCard title="Emergency" value={kpis.emergencyRequests || 0} icon={AlertTriangle} color="red" onClick={() => navigate('/admin/requests?urgency=EMERGENCY')} />
        <StatCard title="Expiring Soon" value={kpis.expiringSoon || 0} icon={Clock} color="rose" onClick={() => navigate('/admin/alerts')} />
        <StatCard title="Low Stock" value={kpis.lowStockCount || 0} icon={Droplet} color="amber" onClick={() => navigate('/admin/thresholds')} />
      </div>

      {/* Inventory Overview (All 8 Blood Groups) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Current Blood Stock by Group</h2>
            <p className="text-xs text-slate-500 mt-0.5">Calculated dynamically from active non-expired inventory units</p>
          </div>
          <button onClick={() => navigate('/admin/inventory')} className="text-xs font-bold text-blood-600 hover:underline">
            View All Units →
          </button>
        </div>

        <div className="grid-auto-fit-sm gap-4">
          {BLOOD_GROUPS.map((bg) => (
            <BloodGroupCard key={bg} bloodGroup={bg} count={data?.inventoryOverview?.[bg] || 0} />
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-4000">
        {/* Demand Trend Chart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blood-600" />
              <span>Monthly Demand & Fulfillment Trend</span>
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requested" stroke="#ef4444" name="Requested" strokeWidth={2.5} />
                <Line type="monotone" dataKey="fulfilled" stroke="#10b981" name="Fulfilled" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock & Critical Alerts */}
        <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Replenishment Watchlist</span>
            </h3>

            {(!data?.lowStockGroups || data.lowStockGroups.length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                All blood group stock levels are currently ADEQUATE.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {data.lowStockGroups.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900">{item.bloodGroup}</span>
                      <span className="text-slate-500 ml-2">({item.component})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-slate-700">{item.currentStock} / min {item.minimumStock}</span>
                      <StatusBadge type="stock" status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 animate-fade-in-up animation-delay-2000 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/50">
          <h3 className="font-bold text-slate-800 text-sm">Recent Hospital Blood Requests</h3>
          <button onClick={() => navigate('/admin/requests')} className="text-xs font-bold text-blood-600 hover:underline">
            View All Requests →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Hospital</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentRequests?.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{r.hospitalId?.hospitalName || 'Hospital'}</td>
                  <td className="px-4 py-3 font-bold text-blood-600">{r.bloodGroup}</td>
                  <td className="px-4 py-3">{r.component}</td>
                  <td className="px-4 py-3 font-bold">{r.quantity}</td>
                  <td className="px-4 py-3"><StatusBadge type="urgency" status={r.urgency} /></td>
                  <td className="px-4 py-3"><StatusBadge type="request" status={r.status} /></td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
