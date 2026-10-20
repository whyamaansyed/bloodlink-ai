import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CompatibilityMatrixModal } from '../components/demand/CompatibilityMatrixModal';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../utils/constants';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, BarChart2, PieChart as PieChartIcon, Activity, Info, RefreshCw } from 'lucide-react';

export const DemandAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compatibilityModalOpen, setCompatibilityModalOpen] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [componentFilter, setComponentFilter] = useState('');

  const fetchDemandAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      if (componentFilter) params.component = componentFilter;

      const { data } = await api.get('/demand', { params });
      if (data.success) {
        setData(data);
      }
    } catch (err) {
      console.error('Failed to fetch demand analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandAnalytics();
  }, [startDate, endDate, bloodGroupFilter, componentFilter]);

  if (loading) return <LoadingSpinner text="Computing Recharts demand analytics..." />;

  const summary = data?.summary || {};
  const statusPieData = [
    { name: 'Fulfilled', value: summary.fulfilledRequests || 0, color: '#10b981' },
    { name: 'Pending', value: summary.pendingRequests || 0, color: '#f59e0b' },
    { name: 'Rejected', value: summary.rejectedRequests || 0, color: '#ef4444' }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">SMART Demand Analytics Engine</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-dimensional demand trends, fulfillment rates, and stock-to-demand gap metrics</p>
        </div>
        <button
          onClick={() => setCompatibilityModalOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
        >
          <Info className="w-4 h-4 text-blood-400" />
          <span>Compatibility Guide</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 grid sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Component</label>
          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2"
          >
            <option value="">All Components</option>
            {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2"
          />
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Requests</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary.totalRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Fulfilled</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{summary.fulfilledRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Rejected</p>
          <p className="text-xl font-bold text-red-600 mt-1">{summary.rejectedRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Emergency Count</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{summary.emergencyRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Fulfillment Rate</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{summary.fulfillmentRate}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Pending Queue</p>
          <p className="text-xl font-bold text-purple-600 mt-1">{summary.pendingRequests}</p>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">1. Monthly Demand vs Fulfillment Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requested" stroke="#ef4444" strokeWidth={2.5} name="Requested" />
                <Line type="monotone" dataKey="fulfilled" stroke="#10b981" strokeWidth={2.5} name="Fulfilled" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Group Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">2. Demand Distribution by Blood Group</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.bloodGroupDemand || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="requested" fill="#dc2626" name="Requested Units" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fulfilled" fill="#059669" name="Fulfilled Units" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Component Demand Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">3. Demand by Component Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.componentDemand || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="component" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="requested" fill="#0284c7" name="Units Requested" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Stock vs Average Demand */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">4. Current Available Stock vs Average Demand</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.stockVsDemand || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="currentStock" fill="#10b981" name="Current Available Stock" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgMonthlyDemand" fill="#f59e0b" name="Avg Monthly Demand" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <CompatibilityMatrixModal
        isOpen={compatibilityModalOpen}
        onClose={() => setCompatibilityModalOpen(false)}
      />
    </div>
  );
};
