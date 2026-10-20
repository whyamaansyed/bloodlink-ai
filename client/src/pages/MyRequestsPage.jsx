import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatDate } from '../utils/formatters';
import { Plus, XCircle, RefreshCw } from 'lucide-react';
import { CreateRequestModal } from '../components/requests/CreateRequestModal';

export const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get('/requests', { params });
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch hospital requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [statusFilter]);

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await api.patch(`/requests/${cancelId}/cancel`);
      fetchMyRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleCreateRequest = async (formData) => {
    try {
      await api.post('/requests', formData);
      fetchMyRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const columns = [
    { header: 'Patient Ref', key: 'patientReference', render: (row) => <span className="font-bold text-slate-800 font-mono">{row.patientReference}</span> },
    { header: 'Blood Group', key: 'bloodGroup', render: (row) => <span className="font-black text-blood-600 text-sm">{row.bloodGroup}</span> },
    { header: 'Component', key: 'component' },
    { header: 'Qty', key: 'quantity', render: (row) => <span className="font-bold">{row.quantity} units</span> },
    { header: 'Urgency', key: 'urgency', render: (row) => <StatusBadge type="urgency" status={row.urgency} /> },
    { header: 'Status', key: 'status', render: (row) => <StatusBadge type="request" status={row.status} /> },
    { header: 'Required Date', key: 'requiredDate', render: (row) => formatDate(row.requiredDate) },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <div>
          {row.status === 'PENDING' && (
            <button
              onClick={() => setCancelId(row._id)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center space-x-1"
            >
              <XCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Submitted Blood Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Track request approval lifecycle, fulfillment dispatches, and emergency submissions</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Blood Request</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['', 'PENDING', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {st || 'All Requests'}
            </button>
          ))}
        </div>

        <button onClick={fetchMyRequests} className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching request history..." />
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          itemsPerPage={10}
          emptyTitle="No requests found"
          emptyDescription="You have not submitted any blood requests matching your filter."
        />
      )}

      <CreateRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateRequest}
      />

      {cancelId && (
        <ConfirmDialog
          isOpen={!!cancelId}
          onClose={() => setCancelId(null)}
          onConfirm={handleCancel}
          title="Cancel Blood Request"
          message="Are you sure you want to cancel this pending blood request?"
          confirmText="Yes, Cancel Request"
        />
      )}
    </div>
  );
};
