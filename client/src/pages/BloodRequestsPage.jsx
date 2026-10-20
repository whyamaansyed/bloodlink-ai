import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { RejectRequestModal } from '../components/requests/RejectRequestModal';
import { IntelligentMatchModal } from '../components/requests/IntelligentMatchModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { CheckCircle2, XCircle, PackageCheck, Cpu, ArrowUpDown, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const BloodRequestsPage = () => {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [urgencyFilter, setUrgencyFilter] = useState(searchParams.get('urgency') || '');
  const [sortByPriority, setSortByPriority] = useState(false);

  const [rejectingId, setRejectingId] = useState(null);
  const [fulfillingId, setFulfillingId] = useState(null);
  const [matchingRequestId, setMatchingRequestId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;
      if (sortByPriority) params.sortByPriority = 'true';

      const { data } = await api.get('/requests', { params });
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter, sortByPriority]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectingId) return;
    try {
      await api.patch(`/requests/${rejectingId}/reject`, { rejectionReason: reason });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleFulfillConfirm = async () => {
    if (!fulfillingId) return;
    try {
      await api.patch(`/requests/${fulfillingId}/fulfill`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Fulfillment failed');
    }
  };

  const columns = [
    {
      header: 'Hospital',
      key: 'hospitalId',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.hospitalId?.hospitalName || 'Hospital'}</p>
          <p className="text-xs text-slate-400">Ref: {row.patientReference}</p>
        </div>
      )
    },
    {
      header: 'Blood Group',
      key: 'bloodGroup',
      render: (row) => <span className="font-black text-blood-600 text-sm">{row.bloodGroup}</span>
    },
    { header: 'Component', key: 'component' },
    { header: 'Qty Needed', key: 'quantity', render: (row) => <span className="font-extrabold text-slate-900">{row.quantity} units</span> },
    {
      header: 'Urgency & Priority',
      key: 'urgency',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <StatusBadge type="urgency" status={row.urgency} />
          {row.priorityScore && (
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-100 text-slate-700 rounded border border-slate-200">
              P-Score: {row.priorityScore}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge type="request" status={row.status} />
    },
    { header: 'Required Date', key: 'requiredDate', render: (row) => formatDate(row.requiredDate) },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMatchingRequestId(row._id)}
            className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs font-bold flex items-center space-x-1"
            title="Run Intelligent Compatibility Matching Engine"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Match</span>
          </button>

          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(row._id)}
                className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center space-x-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => setRejectingId(row._id)}
                className="px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg flex items-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}

          {(row.status === 'APPROVED' || row.status === 'PENDING') && (
            <button
              onClick={() => setFulfillingId(row._id)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Fulfill</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospital Blood Request Workflow & Priority Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Review requests with priority queue ranking, intelligent compatibility matching, and FEFO fulfillment</p>
        </div>
        <button
          onClick={() => setSortByPriority(!sortByPriority)}
          className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center space-x-1.5 transition-all ${
            sortByPriority
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>{sortByPriority ? 'Priority Ranked Queue ON' : 'Sort by Priority Queue'}</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
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

        <div className="flex items-center space-x-3">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-semibold"
          >
            <option value="">All Urgencies</option>
            <option value="NORMAL">Normal</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENCY">EMERGENCY</option>
          </select>
          <button onClick={fetchRequests} className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching request priority queue..." />
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          itemsPerPage={10}
          emptyTitle="No requests found"
          emptyDescription="No blood requests match your selected filters."
        />
      )}

      {matchingRequestId && (
        <IntelligentMatchModal
          isOpen={!!matchingRequestId}
          onClose={() => setMatchingRequestId(null)}
          requestId={matchingRequestId}
        />
      )}

      {rejectingId && (
        <RejectRequestModal
          isOpen={!!rejectingId}
          onClose={() => setRejectingId(null)}
          onConfirm={handleRejectConfirm}
        />
      )}

      {fulfillingId && (
        <ConfirmDialog
          isOpen={!!fulfillingId}
          onClose={() => setFulfillingId(null)}
          onConfirm={handleFulfillConfirm}
          title="Fulfill Blood Request"
          message="Fulfilling this request will allocate eligible non-expired inventory units using FEFO strategy, mark them as ISSUED, decrement available stock, and notify the hospital. Proceed?"
          confirmText="Fulfill & Issue Blood"
          confirmButtonClass="bg-emerald-600 hover:bg-emerald-700 text-white"
        />
      )}
    </div>
  );
};
