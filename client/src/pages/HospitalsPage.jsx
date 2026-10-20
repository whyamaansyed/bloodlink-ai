import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable } from '../components/common/DataTable';
import { SearchBar } from '../components/common/SearchBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Building2, Phone, Mail } from 'lucide-react';

export const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/hospitals', { params: { search } });
      if (data.success) {
        setHospitals(data.hospitals);
      }
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [search]);

  const columns = [
    {
      header: 'Hospital Name',
      key: 'hospitalName',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.hospitalName}</p>
          <p className="text-[11px] font-mono text-slate-400">{row.registrationNumber}</p>
        </div>
      )
    },
    { header: 'Contact Person', key: 'contactPerson' },
    { header: 'City', key: 'city', render: (row) => <span className="font-semibold">{row.city}</span> },
    { header: 'Phone', key: 'phone' },
    { header: 'Emergency Contact', key: 'emergencyContact', render: (row) => <span className="font-bold text-blood-600">{row.emergencyContact}</span> },
    { header: 'Email', key: 'email', render: (row) => row.email }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Registered Hospital Facilities</h1>
          <p className="text-xs text-slate-500 mt-1">Directory of partner hospitals authorized to submit emergency and standard blood requests</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <SearchBar value={search} onChange={setSearch} placeholder="Search hospital name or city..." />
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching hospital records..." />
      ) : (
        <DataTable
          columns={columns}
          data={hospitals}
          itemsPerPage={10}
          emptyTitle="No hospitals found"
          emptyDescription="No registered healthcare facilities found."
        />
      )}
    </div>
  );
};
