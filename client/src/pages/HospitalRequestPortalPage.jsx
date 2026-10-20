import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDate } from '../utils/formatters';
import {
  FileText,
  HeartHandshake,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  AlertTriangle,
  User,
  ShieldAlert,
  ChevronRight,
  Eye,
  Check,
  X,
  UserCheck,
  FlaskConical,
  Boxes,
  AlertCircle
} from 'lucide-react';

export const HospitalRequestPortalPage = () => {
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters & Search
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, DONATION, PATIENT
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, UNDER_REVIEW, APPROVED, SCHEDULED, CHECK_IN, DONATED, TESTING, REJECTED, COMPLETED, FULFILLED, CANCELLED
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Detail Modal State
  const [selectedItem, setSelectedItem] = useState(null); // { item, type: 'DONATION' | 'PATIENT' }
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Deferral Modal State
  const [deferModalOpen, setDeferModalOpen] = useState(false);
  const [deferralReason, setDeferralReason] = useState('');

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00 AM - 11:00 AM');

  const fetchPortalData = async () => {
    try {
      setRefreshing(true);
      const [donRes, reqRes] = await Promise.all([
        api.get('/donations'),
        api.get('/requests')
      ]);

      if (donRes.data?.success) {
        setDonations(donRes.data.donations || []);
      }

      if (reqRes.data?.success) {
        setBloodRequests(reqRes.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load hospital request portal data:', err);
      setErrorMessage('Failed to load portal data. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  // Merge and harmonize list items
  const unifiedItems = [
    ...donations.map(d => ({
      raw: d,
      id: d._id,
      code: d.donationId,
      itemType: 'DONATION',
      personName: d.userId?.name || d.donorId?.userId?.name || 'Voluntary Donor',
      bloodGroup: d.bloodGroup,
      component: d.donationType || 'Whole Blood',
      date: d.preferredDate,
      urgency: 'NORMAL',
      status: d.status,
      createdAt: d.createdAt
    })),
    ...bloodRequests.map(r => ({
      raw: r,
      id: r._id,
      code: r.patientReference,
      itemType: 'PATIENT',
      personName: `Patient: ${r.patientReference}`,
      bloodGroup: r.bloodGroup,
      component: r.component,
      date: r.requiredDate,
      urgency: r.urgency,
      status: r.status,
      createdAt: r.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Compute KPI metrics
  const kpis = {
    totalAssigned: unifiedItems.length,
    pending: unifiedItems.filter(i => i.status === 'DONATION_REQUESTED' || i.status === 'PENDING').length,
    inProgress: unifiedItems.filter(i => ['UNDER_REVIEW', 'APPROVED', 'SCHEDULED', 'CHECK_IN', 'SCREENING', 'DONATED', 'TESTING'].includes(i.status)).length,
    completed: unifiedItems.filter(i => ['AVAILABLE', 'COMPLETED', 'FULFILLED'].includes(i.status)).length,
    rejectedOrCancelled: unifiedItems.filter(i => ['REJECTED', 'CANCELLED', 'DEFERRED'].includes(i.status)).length
  };

  // Filter items
  const filteredItems = unifiedItems.filter(item => {
    // Type Filter
    if (typeFilter === 'DONATION' && item.itemType !== 'DONATION') return false;
    if (typeFilter === 'PATIENT' && item.itemType !== 'PATIENT') return false;

    // Status Filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING' && !['PENDING', 'DONATION_REQUESTED'].includes(item.status)) return false;
      if (statusFilter === 'UNDER_REVIEW' && item.status !== 'UNDER_REVIEW') return false;
      if (statusFilter === 'APPROVED' && item.status !== 'APPROVED') return false;
      if (statusFilter === 'SCHEDULED' && item.status !== 'SCHEDULED') return false;
      if (statusFilter === 'CHECK_IN' && item.status !== 'CHECK_IN') return false;
      if (statusFilter === 'DONATED' && item.status !== 'DONATED') return false;
      if (statusFilter === 'TESTING' && item.status !== 'TESTING') return false;
      if (statusFilter === 'COMPLETED' && !['COMPLETED', 'FULFILLED', 'AVAILABLE'].includes(item.status)) return false;
      if (statusFilter === 'REJECTED' && !['REJECTED', 'CANCELLED', 'DEFERRED'].includes(item.status)) return false;
    }

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCode = item.code?.toLowerCase().includes(term);
      const matchName = item.personName?.toLowerCase().includes(term);
      const matchBg = item.bloodGroup?.toLowerCase().includes(term);
      if (!matchCode && !matchName && !matchBg) return false;
    }

    return true;
  });

  // Action Handler: Status Updates
  const handleUpdateStatus = async (item, newStatus, extraData = {}) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setActionLoading(true);
      if (item.itemType === 'DONATION') {
        const { data } = await api.patch(`/donations/${item.id}/status`, {
          status: newStatus,
          ...extraData
        });
        if (data.success) {
          setSuccessMessage(`Donation ${item.code} status updated to ${newStatus}.`);
          // Refresh item detail
          setSelectedItem({
            ...item,
            raw: data.donation,
            status: data.donation.status
          });
        }
      } else {
        let endpoint = `/requests/${item.id}/approve`;
        let payload = {};

        if (newStatus === 'APPROVED') endpoint = `/requests/${item.id}/approve`;
        else if (newStatus === 'REJECTED') {
          endpoint = `/requests/${item.id}/reject`;
          payload = { rejectionReason: extraData.rejectionReason || 'Medical criteria not met.' };
        } else if (newStatus === 'FULFILLED') endpoint = `/requests/${item.id}/fulfill`;
        else if (newStatus === 'CANCELLED') endpoint = `/requests/${item.id}/cancel`;

        const { data } = await api.patch(endpoint, payload);
        if (data.success) {
          setSuccessMessage(`Blood Request ${item.code} status updated to ${newStatus}.`);
          setSelectedItem({
            ...item,
            raw: data.request,
            status: data.request.status
          });
        }
      }
      await fetchPortalData();
    } catch (err) {
      console.error('Failed to update status:', err);
      setErrorMessage(
        err.response?.data?.message || 'Unable to update request. The current workflow state does not allow this action.'
      );
    } finally {
      setActionLoading(false);
      setRejectModalOpen(false);
      setDeferModalOpen(false);
      setScheduleModalOpen(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Hospital Request Portal..." />;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-blood-100 text-blood-700 text-[10px] font-black uppercase rounded-md tracking-wider">Hospital Portal</span>
            <span className="text-xs text-slate-400 font-semibold">• Isolated Request Routing</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Hospital Request Operations Portal</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage incoming donor blood donations and patient blood requests routed specifically to your facility.</p>
        </div>
        <button
          onClick={fetchPortalData}
          disabled={refreshing}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blood-600' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Portal'}</span>
        </button>
      </div>

      {/* Global Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Assigned</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{kpis.totalAssigned}</span>
            <span className="text-[10px] text-slate-400 font-bold">Requests</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-slate-800 h-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm flex flex-col justify-between space-y-2 bg-amber-50/20">
          <span className="text-amber-700 text-[11px] font-bold uppercase tracking-wider">Pending Review</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-600">{kpis.pending}</span>
            <span className="text-[10px] text-amber-600/70 font-bold">Action Req.</span>
          </div>
          <div className="w-full bg-amber-100 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: `${kpis.totalAssigned ? (kpis.pending / kpis.totalAssigned) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm flex flex-col justify-between space-y-2 bg-blue-50/20">
          <span className="text-blue-700 text-[11px] font-bold uppercase tracking-wider">In Progress Workflow</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-blue-600">{kpis.inProgress}</span>
            <span className="text-[10px] text-blue-600/70 font-bold">Scheduled/Testing</span>
          </div>
          <div className="w-full bg-blue-100 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${kpis.totalAssigned ? (kpis.inProgress / kpis.totalAssigned) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex flex-col justify-between space-y-2 bg-emerald-50/20">
          <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Completed / Available</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-600">{kpis.completed}</span>
            <span className="text-[10px] text-emerald-600/70 font-bold">In Inventory</span>
          </div>
          <div className="w-full bg-emerald-100 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${kpis.totalAssigned ? (kpis.completed / kpis.totalAssigned) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Rejected / Deferred</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-500">{kpis.rejectedOrCancelled}</span>
            <span className="text-[10px] text-slate-400 font-bold">Closed</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-slate-400 h-full" style={{ width: `${kpis.totalAssigned ? (kpis.rejectedOrCancelled / kpis.totalAssigned) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Request Type Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Requests ({unifiedItems.length})
            </button>
            <button
              onClick={() => setTypeFilter('DONATION')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                typeFilter === 'DONATION' ? 'bg-white text-blood-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-blood-600" />
              <span>Donor Donations ({donations.length})</span>
            </button>
            <button
              onClick={() => setTypeFilter('PATIENT')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                typeFilter === 'PATIENT' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Patient Blood Requests ({bloodRequests.length})</span>
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search donor, ID, blood group..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-blood-500 focus:border-blood-500"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {[
            { id: 'ALL', label: 'All Statuses' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'SCHEDULED', label: 'Scheduled' },
            { id: 'CHECK_IN', label: 'Check-In' },
            { id: 'DONATED', label: 'Donated' },
            { id: 'TESTING', label: 'Testing' },
            { id: 'COMPLETED', label: 'Available / Completed' },
            { id: 'REJECTED', label: 'Rejected / Deferred' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unified Requests Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Request ID / Ref</th>
                <th className="px-5 py-3.5">Person</th>
                <th className="px-5 py-3.5">Blood Group & Component</th>
                <th className="px-5 py-3.5">Required / Appt Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No requests found</p>
                    <p className="text-xs text-slate-400 mt-0.5">No incoming requests match your active filters for this hospital.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={`${item.itemType}-${item.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      {item.itemType === 'DONATION' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-red-50 text-blood-700 font-bold text-[10px] rounded-lg border border-red-200">
                          <HeartHandshake className="w-3 h-3 text-blood-600" />
                          <span>DONATION</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-lg border border-blue-200">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>PATIENT REQUEST</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {item.code}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {item.personName}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-blood-600 bg-blood-50 px-2 py-0.5 rounded text-xs">
                          {item.bloodGroup}
                        </span>
                        <span className="text-slate-600 font-medium">{item.component}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge type={item.itemType === 'DONATION' ? 'donation' : 'request'} status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail View & Workflow Drawer/Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 font-bold text-[10px] rounded-md ${
                    selectedItem.itemType === 'DONATION' ? 'bg-red-100 text-blood-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedItem.itemType === 'DONATION' ? 'DONOR DONATION REQUEST' : 'PATIENT BLOOD REQUEST'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{selectedItem.code}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">Request Operational Details</h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Person / Ref</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedItem.personName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Blood Group</span>
                <span className="font-black text-blood-600 text-sm mt-0.5 block">{selectedItem.bloodGroup}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Component</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{selectedItem.component}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Status</span>
                <div className="mt-1">
                  <StatusBadge type={selectedItem.itemType === 'DONATION' ? 'donation' : 'request'} status={selectedItem.status} />
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Hospital</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {selectedItem.raw.hospitalId?.hospitalName || 'Your Hospital'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Date Required/Appt</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{formatDate(selectedItem.date)}</span>
              </div>
            </div>

            {/* Donation Health Declaration details if applicable */}
            {selectedItem.itemType === 'DONATION' && selectedItem.raw.healthDeclaration && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-xs text-slate-800">Donor Self-Declared Health Screening</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Feeling Well Today</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>No Recent Illness (14d)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>No Antibiotics / Meds</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>No Tattoo (6m)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection / Deferral text if present */}
            {selectedItem.raw.rejectionReason && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
                <span className="font-bold block uppercase text-[10px]">Rejection Reason</span>
                <p>{selectedItem.raw.rejectionReason}</p>
              </div>
            )}
            {selectedItem.raw.deferralReason && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <span className="font-bold block uppercase text-[10px]">Deferral Notes</span>
                <p>{selectedItem.raw.deferralReason}</p>
              </div>
            )}

            {/* Lifecycle Timeline */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Request Operational Timeline</h3>
              <div className="space-y-3 pl-2 border-l-2 border-slate-200 text-xs">
                <div className="relative pl-4">
                  <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-white" />
                  <p className="font-bold text-slate-800">Request Submitted by Creator</p>
                  <p className="text-[10px] text-slate-400">{formatDate(selectedItem.createdAt)}</p>
                </div>
                <div className="relative pl-4">
                  <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white" />
                  <p className="font-bold text-slate-800">Assigned & Received by Hospital</p>
                  <p className="text-[10px] text-slate-400">Verified routed to hospital ID</p>
                </div>

                {['APPROVED', 'SCHEDULED', 'CHECK_IN', 'DONATED', 'TESTING', 'AVAILABLE', 'COMPLETED', 'FULFILLED'].includes(selectedItem.status) && (
                  <div className="relative pl-4">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white" />
                    <p className="font-bold text-emerald-700">Screening Approved</p>
                    <p className="text-[10px] text-slate-400">Medical eligibility verified</p>
                  </div>
                )}

                {['SCHEDULED', 'CHECK_IN', 'DONATED', 'TESTING', 'AVAILABLE', 'COMPLETED'].includes(selectedItem.status) && (
                  <div className="relative pl-4">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white" />
                    <p className="font-bold text-indigo-700">Appointment Scheduled</p>
                    <p className="text-[10px] text-slate-400">Time slot assigned</p>
                  </div>
                )}

                {['CHECK_IN', 'DONATED', 'TESTING', 'AVAILABLE', 'COMPLETED'].includes(selectedItem.status) && (
                  <div className="relative pl-4">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-purple-600 border-2 border-white" />
                    <p className="font-bold text-purple-700">Donor Checked In</p>
                    <p className="text-[10px] text-slate-400">Arrived at hospital facility</p>
                  </div>
                )}

                {['DONATED', 'TESTING', 'AVAILABLE', 'COMPLETED'].includes(selectedItem.status) && (
                  <div className="relative pl-4">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blood-600 border-2 border-white" />
                    <p className="font-bold text-blood-700">Blood Collection Completed</p>
                    <p className="text-[10px] text-slate-400">Unit collected from donor</p>
                  </div>
                )}

                {['TESTING', 'AVAILABLE', 'COMPLETED'].includes(selectedItem.status) && (
                  <div className="relative pl-4">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-amber-600 border-2 border-white" />
                    <p className="font-bold text-amber-700">Laboratory Testing & Screening</p>
                    <p className="text-[10px] text-slate-400">Lab verification in progress</p>
                  </div>
                )}

                {['AVAILABLE', 'COMPLETED', 'FULFILLED'].includes(selectedItem.status) && (
                  <div className="relative pl-4">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                    <p className="font-bold text-emerald-600">Unit Verified & Available in Central Inventory</p>
                    <p className="text-[10px] text-slate-400">Registered in BloodInventory (FEFO)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Action Controls */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="font-bold text-xs text-slate-700">Workflow Action Controls</h3>
              <div className="flex flex-wrap gap-2">
                {selectedItem.itemType === 'DONATION' ? (
                  <>
                    {/* State: DONATION_REQUESTED / UNDER_REVIEW */}
                    {['DONATION_REQUESTED', 'UNDER_REVIEW'].includes(selectedItem.status) && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedItem, 'APPROVED')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Health Screening</span>
                        </button>

                        <button
                          onClick={() => {
                            setScheduleDate(selectedItem.raw.preferredDate ? new Date(selectedItem.raw.preferredDate).toISOString().split('T')[0] : '');
                            setScheduleModalOpen(true);
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule Appointment</span>
                        </button>
                      </>
                    )}

                    {/* State: APPROVED */}
                    {selectedItem.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => {
                            setScheduleDate(selectedItem.raw.preferredDate ? new Date(selectedItem.raw.preferredDate).toISOString().split('T')[0] : '');
                            setScheduleModalOpen(true);
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule Appointment</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(selectedItem, 'CHECK_IN')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Check In Donor</span>
                        </button>
                      </>
                    )}

                    {/* State: SCHEDULED */}
                    {selectedItem.status === 'SCHEDULED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedItem, 'CHECK_IN')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Check In Donor</span>
                        </button>

                        <button
                          onClick={() => setDeferModalOpen(true)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Defer Appointment</span>
                        </button>
                      </>
                    )}

                    {/* State: CHECK_IN */}
                    {selectedItem.status === 'CHECK_IN' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedItem, 'DONATED')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Complete Donation (Blood Collected)</span>
                        </button>

                        <button
                          onClick={() => setDeferModalOpen(true)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Defer Donor</span>
                        </button>
                      </>
                    )}

                    {/* State: DONATED */}
                    {selectedItem.status === 'DONATED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedItem, 'TESTING')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Send to Lab Testing</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(selectedItem, 'AVAILABLE')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>Complete & Add to Inventory</span>
                        </button>
                      </>
                    )}

                    {/* State: TESTING */}
                    {selectedItem.status === 'TESTING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedItem, 'AVAILABLE')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lab Passed & Add to Inventory</span>
                        </button>

                        <button
                          onClick={() => setRejectModalOpen(true)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Fail Lab Testing</span>
                        </button>
                      </>
                    )}

                    {/* State: AVAILABLE / COMPLETED */}
                    {['AVAILABLE', 'COMPLETED'].includes(selectedItem.status) && (
                      <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                        <Boxes className="w-4 h-4 text-emerald-600" />
                        <span>Blood Unit Available in Inventory (FEFO Stock Active)</span>
                      </div>
                    )}

                    {/* Rejection / Cancellation option for active non-terminal states */}
                    {!['REJECTED', 'CANCELLED', 'AVAILABLE', 'DEFERRED', 'COMPLETED'].includes(selectedItem.status) && (
                      <button
                        onClick={() => setRejectModalOpen(true)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Cancel / Reject Request</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* PATIENT REQUEST ACTIONS */}
                    {selectedItem.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedItem, 'APPROVED')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Blood Request</span>
                      </button>
                    )}

                    {['PENDING', 'APPROVED'].includes(selectedItem.status) && (
                      <button
                        onClick={() => handleUpdateStatus(selectedItem, 'FULFILLED')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fulfill Blood Request (FEFO Allocation)</span>
                      </button>
                    )}

                    {selectedItem.status === 'FULFILLED' && (
                      <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Blood Request Fulfilled & Units Dispatched</span>
                      </div>
                    )}

                    {!['FULFILLED', 'CANCELLED', 'REJECTED'].includes(selectedItem.status) && (
                      <button
                        onClick={() => setRejectModalOpen(true)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Reject Blood Request</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Reject Request</h3>
            <p className="text-xs text-slate-500">Please state the medical or operational reason for rejecting this request. This will be sent to the requester.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g., Insufficient inventory, donor medical deferral..."
              rows={3}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500"
              required
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedItem, 'REJECTED', { rejectionReason })}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deferral Reason Modal */}
      {deferModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Defer Donation Appointment</h3>
            <p className="text-xs text-slate-500">Specify the deferral reason or timeframe (e.g. low hemoglobin, temporary medication).</p>
            <textarea
              value={deferralReason}
              onChange={(e) => setDeferralReason(e.target.value)}
              placeholder="E.g., Temporary low hemoglobin count. Defer 14 days."
              rows={3}
              className="w-full p-3 text-xs border border-amber-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
              required
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeferModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedItem, 'DEFERRED', { deferralReason })}
                disabled={actionLoading || !deferralReason.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm Deferral
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Donation Modal */}
      {scheduleModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Schedule Donation Appointment</h3>
            <p className="text-xs text-slate-500">Confirm or adjust the appointment date and time for donor {selectedItem.personName}.</p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Time Slot</label>
              <select
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
              >
                <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
              </select>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedItem, 'SCHEDULED', { preferredDate: scheduleDate, preferredTime: scheduleTime })}
                disabled={actionLoading || !scheduleDate}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
