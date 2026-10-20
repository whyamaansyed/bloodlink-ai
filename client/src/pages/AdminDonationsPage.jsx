import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import {
  HeartHandshake,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  UserCheck,
  Building2,
  Boxes,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const AdminDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const { data } = await api.get('/donations', { params });
      if (data.success) {
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error('Failed to fetch donations for admin:', err);
      setError('Failed to load blood donation requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleUpdateStatus = async (donationId, targetStatus) => {
    let notes = '';
    let rejectionReason = '';

    if (targetStatus === 'REJECTED') {
      rejectionReason = window.prompt('Please provide a reason for rejection:');
      if (rejectionReason === null) return;
    } else if (targetStatus === 'DEFERRED') {
      notes = window.prompt('Please provide deferral period/reason:');
      if (notes === null) return;
    }

    try {
      setUpdatingId(donationId);
      setError('');
      setSuccessMsg('');

      const { data } = await api.patch(`/donations/${donationId}/status`, {
        status: targetStatus,
        notes,
        rejectionReason,
        deferralReason: notes
      });

      if (data.success) {
        setSuccessMsg(`Donation ${data.donation.donationId} status updated to ${targetStatus}`);
        fetchDonations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update donation status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderActionButtons = (item) => {
    const isBusy = updatingId === item._id;

    switch (item.status) {
      case 'DONATION_REQUESTED':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleUpdateStatus(item._id, 'SCHEDULED')}
              disabled={isBusy}
              className="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              Schedule
            </button>
            <button
              onClick={() => handleUpdateStatus(item._id, 'REJECTED')}
              disabled={isBusy}
              className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-red-50 text-red-600 rounded-lg transition-all"
            >
              Reject
            </button>
          </div>
        );
      case 'SCHEDULED':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleUpdateStatus(item._id, 'CHECK_IN')}
              disabled={isBusy}
              className="px-2.5 py-1 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
            >
              Check In
            </button>
            <button
              onClick={() => handleUpdateStatus(item._id, 'DEFERRED')}
              disabled={isBusy}
              className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-amber-50 text-amber-700 rounded-lg transition-all"
            >
              Defer
            </button>
          </div>
        );
      case 'CHECK_IN':
        return (
          <button
            onClick={() => handleUpdateStatus(item._id, 'SCREENING')}
            disabled={isBusy}
            className="px-2.5 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all"
          >
            Start Screening
          </button>
        );
      case 'SCREENING':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleUpdateStatus(item._id, 'APPROVED')}
              disabled={isBusy}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
            >
              Approve
            </button>
            <button
              onClick={() => handleUpdateStatus(item._id, 'REJECTED')}
              disabled={isBusy}
              className="px-2.5 py-1 text-xs font-bold bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-all"
            >
              Reject
            </button>
          </div>
        );
      case 'APPROVED':
        return (
          <button
            onClick={() => handleUpdateStatus(item._id, 'DONATED')}
            disabled={isBusy}
            className="px-2.5 py-1 text-xs font-bold bg-blood-600 hover:bg-blood-700 text-white rounded-lg transition-all"
          >
            Record Collection
          </button>
        );
      case 'DONATED':
        return (
          <button
            onClick={() => handleUpdateStatus(item._id, 'TESTING')}
            disabled={isBusy}
            className="px-2.5 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
          >
            Send to Lab Testing
          </button>
        );
      case 'TESTING':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleUpdateStatus(item._id, 'AVAILABLE')}
              disabled={isBusy}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all"
            >
              Complete & Add Stock
            </button>
            <button
              onClick={() => handleUpdateStatus(item._id, 'REJECTED')}
              disabled={isBusy}
              className="px-2.5 py-1 text-xs font-bold bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-all"
            >
              Fail Testing
            </button>
          </div>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-slate-400">
            {item.bloodUnitRef?.unitId ? `Stock Unit: ${item.bloodUnitRef.unitId}` : 'Completed'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Donor Blood Donation Processing</h1>
          <p className="text-xs text-slate-500 mt-1">Medical screening, appointment scheduling, and laboratory testing lifecycle queue</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, donor name..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-blood-500"
          />
        </form>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs font-semibold border border-slate-300 rounded-xl w-full sm:w-auto"
          >
            <option value="">All Workflow Statuses</option>
            <option value="DONATION_REQUESTED">DONATION_REQUESTED</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="CHECK_IN">CHECK_IN</option>
            <option value="SCREENING">SCREENING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="DONATED">DONATED</option>
            <option value="TESTING">TESTING</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Donations List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <LoadingSpinner text="Loading donation workflow queue..." />
        ) : donations.length === 0 ? (
          <p className="text-xs text-slate-400 p-8 text-center bg-slate-50 rounded-xl">No donation requests match the specified criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Donation ID</th>
                  <th className="px-4 py-3">Donor Name</th>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Scheduled Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Available Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{d.donationId}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{d.userId?.name || 'Voluntary Donor'}</td>
                    <td className="px-4 py-3 font-extrabold text-blood-600">{d.bloodGroup}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(d.preferredDate)} ({d.preferredTime})</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        d.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'CANCELLED' || d.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {renderActionButtons(d)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
