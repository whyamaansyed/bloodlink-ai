import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BloodGroupCard } from '../components/common/BloodGroupCard';
import { CreateRequestModal } from '../components/requests/CreateRequestModal';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../utils/constants';
import { Search, Plus } from 'lucide-react';

export const AvailableBloodPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/inventory/summary');
      if (data.success) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to fetch available blood:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleCreateRequest = async (formData) => {
    try {
      await api.post('/requests', formData);
      alert('Blood Request Submitted Successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Request submission failed');
    }
  };

  if (loading) return <LoadingSpinner text="Querying available central stock..." />;

  const detailedMatrix = summary?.detailedMatrix || [];
  const filteredMatrix = detailedMatrix.filter(item => {
    if (selectedGroup && item.bloodGroup !== selectedGroup) return false;
    if (selectedComponent && item.component !== selectedComponent) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Available Blood Stock Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Search real-time non-expired inventory stock across all blood groups and components</p>
        </div>
        <button
          onClick={() => setRequestModalOpen(true)}
          className="px-4 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Request</span>
        </button>
      </div>

      {/* Filter controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-bold"
        >
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>

        <select
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All Components</option>
          {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Component</th>
                <th className="px-6 py-4">Available Quantity</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-black text-blood-600 text-sm">{item.bloodGroup}</td>
                  <td className="px-6 py-4">{item.component}</td>
                  <td className="px-6 py-4 font-extrabold text-slate-900 text-sm">{item.currentStock} units</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      item.status === 'ADEQUATE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      item.status === 'LOW STOCK' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      'bg-red-100 text-red-800 border-red-300 font-bold'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setRequestModalOpen(true)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                    >
                      Request This Group
                    </button>
                  </td>
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
