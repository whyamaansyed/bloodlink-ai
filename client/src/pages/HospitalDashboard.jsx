import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { BloodGroupCard } from '../components/common/BloodGroupCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { CreateRequestModal } from '../components/requests/CreateRequestModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { BLOOD_GROUPS } from '../utils/constants';
import { Plus, FileText, CheckCircle, Clock, AlertTriangle, Building2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HospitalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/dashboard/summary');
      if (data.success) {
        setData(data);
      }
    } catch (err) {
      console.error('Failed to fetch hospital dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateRequest = async (formData) => {
    try {
      await api.post('/requests', formData);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit blood request');
    }
  };

  if (loading) return <LoadingSpinner text="Loading Hospital Operations Portal..." />;

  const kpis = data?.kpis || {};
  const profile = data?.hospitalProfile || {};

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile.hospitalName || 'Hospital Portal'}</h1>
          <p className="text-xs text-slate-500 mt-1">Registration No: {profile.registrationNumber} • City: {profile.city}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/hospital/request-portal')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition-all"
          >
            <FileText className="w-4 h-4 text-blood-400" />
            <span>Open Request Portal</span>
          </button>
          <button
            onClick={() => setRequestModalOpen(true)}
            className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blood-200 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Blood Request</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Submitted" value={kpis.totalSubmitted || 0} icon={FileText} color="blue" onClick={() => navigate('/hospital/my-requests')} />
        <StatCard title="Pending Review" value={kpis.pendingCount || 0} icon={Clock} color="amber" onClick={() => navigate('/hospital/my-requests?status=PENDING')} />
        <StatCard title="Approved" value={kpis.approvedCount || 0} icon={CheckCircle} color="purple" onClick={() => navigate('/hospital/my-requests?status=APPROVED')} />
        <StatCard title="Fulfilled" value={kpis.fulfilledCount || 0} icon={CheckCircle} color="emerald" onClick={() => navigate('/hospital/my-requests?status=FULFILLED')} />
        <StatCard title="Emergency" value={kpis.emergencyCount || 0} icon={AlertTriangle} color="red" onClick={() => navigate('/hospital/my-requests?urgency=EMERGENCY')} />
      </div>

      {/* Available Stock Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Available Central Blood Inventory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time available non-expired stock in central repository</p>
          </div>
          <button onClick={() => navigate('/hospital/available-blood')} className="text-xs font-bold text-blood-600 hover:underline">
            Search Inventory →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {BLOOD_GROUPS.map((bg) => (
            <BloodGroupCard key={bg} bloodGroup={bg} count={data?.availableStock?.[bg] || 0} />
          ))}
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Your Recent Requests</h3>
          <button onClick={() => navigate('/hospital/my-requests')} className="text-xs font-bold text-blood-600 hover:underline">
            View Request History →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Patient Ref</th>
                <th className="px-4 py-3">Blood Group</th>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentRequests?.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50 font-medium">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.patientReference}</td>
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

      <CreateRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
};
