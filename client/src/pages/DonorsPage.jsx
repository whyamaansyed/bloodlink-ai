import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable } from '../components/common/DataTable';
import { SearchBar } from '../components/common/SearchBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { BLOOD_GROUPS } from '../utils/constants';
import { UserCheck, RefreshCw } from 'lucide-react';

export const DonorsPage = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGroup) params.bloodGroup = selectedGroup;
      if (search) params.search = search;

      const { data } = await api.get('/donors', { params });
      if (data.success) {
        setDonors(data.donors);
      }
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedGroup, search]);

  const columns = [
    {
      header: 'Donor Name',
      key: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.userId?.name || 'Unknown'}</p>
          <p className="text-xs text-slate-400">{row.userId?.email}</p>
        </div>
      )
    },
    {
      header: 'Blood Group',
      key: 'bloodGroup',
      render: (row) => <span className="font-black text-blood-600 text-sm">{row.bloodGroup}</span>
    },
    { header: 'Phone', key: 'phone', render: (row) => row.phone || row.userId?.phone },
    { header: 'Gender', key: 'gender' },
    { header: 'Total Donations', key: 'totalDonations', render: (row) => <span className="font-bold text-slate-900">{row.totalDonations}</span> },
    { header: 'Last Donation', key: 'lastDonationDate', render: (row) => formatDate(row.lastDonationDate) },
    {
      header: 'Eligibility Status',
      key: 'eligibilityStatus',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          {row.eligibilityStatus}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Registered Donors Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage voluntary blood donors, eligibility statuses, and donation frequency</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search donor name or phone..." />

        <div className="flex items-center space-x-3">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          <button onClick={fetchDonors} className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading donor records..." />
      ) : (
        <DataTable
          columns={columns}
          data={donors}
          itemsPerPage={10}
          emptyTitle="No donors found"
          emptyDescription="No registered donors match your query."
        />
      )}
    </div>
  );
};
