import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import {
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock3,
  ArrowLeft,
  Ban,
  ShieldCheck,
  Boxes,
  FileText
} from 'lucide-react';

const TIMELINE_STEPS = [
  { key: 'DONATION_REQUESTED', label: 'Donation Requested', desc: 'Request submitted to blood bank' },
  { key: 'SCHEDULED', label: 'Appointment Scheduled', desc: 'Time slot confirmed' },
  { key: 'CHECK_IN', label: 'Checked In', desc: 'Donor checked in at facility' },
  { key: 'SCREENING', label: 'Medical Screening', desc: 'Pre-donation health assessment' },
  { key: 'APPROVED', label: 'Screening Approved', desc: 'Cleared for blood collection' },
  { key: 'DONATED', label: 'Blood Donated', desc: 'Phlebotomy blood unit collected' },
  { key: 'TESTING', label: 'Laboratory Testing', desc: 'Serology & infectious disease testing' },
  { key: 'AVAILABLE', label: 'Available in Stock', desc: 'Processed & added to inventory' }
];

export const DonationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/donations/${id}`);
        if (data.success) {
          setDonation(data.donation);
        }
      } catch (err) {
        console.error('Failed to load donation details:', err);
        setError(err.response?.data?.message || 'Failed to load donation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this blood donation appointment?')) return;

    try {
      setCancelling(true);
      setError('');
      const { data } = await api.patch(`/donations/${id}/cancel`, { reason: 'Cancelled by donor.' });
      if (data.success) {
        setDonation(data.donation);
        setSuccessMsg('Donation request cancelled successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel donation.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching donation details & status timeline..." />;

  if (!donation) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Donation Record Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested donation record does not exist or you do not have permission to view it.'}</p>
        <Link to="/donor/donations" className="inline-block px-4 py-2 bg-blood-600 text-white rounded-xl text-xs font-bold">
          Back to Donation History
        </Link>
      </div>
    );
  }

  const isTerminal = ['CANCELLED', 'REJECTED', 'DEFERRED'].includes(donation.status);
  const isCancellable = ['DONATION_REQUESTED', 'SCHEDULED'].includes(donation.status);

  // Find step index in pipeline
  const currentStepIdx = TIMELINE_STEPS.findIndex(s => s.key === donation.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/donor/donations"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Donations</span>
        </Link>

        {isCancellable && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-all"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{cancelling ? 'Cancelling...' : 'Cancel Request'}</span>
          </button>
        )}
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

      {/* Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-black text-slate-900 px-3 py-1 bg-slate-100 rounded-lg border border-slate-200">
              {donation.donationId}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              donation.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              donation.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600 border border-slate-300' :
              donation.status === 'REJECTED' || donation.status === 'DEFERRED' ? 'bg-red-100 text-red-800 border border-red-300' :
              'bg-blue-100 text-blue-800 border border-blue-300'
            }`}>
              {donation.status}
            </span>
          </div>

          <h1 className="text-xl font-black text-slate-900 mt-3">
            {donation.donationType} Donation ({donation.bloodGroup})
          </h1>
          <p className="text-xs text-slate-500 mt-1">Submitted on {formatDate(donation.createdAt)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[260px]">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Scheduled Date</span>
            <span className="font-bold text-slate-800">{formatDate(donation.preferredDate)}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Time Slot</span>
            <span className="font-bold text-slate-800">{donation.preferredTime}</span>
          </div>
        </div>
      </div>

      {/* Terminal Alert Banner if Cancelled / Rejected / Deferred */}
      {isTerminal && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-start space-x-3 ${
          donation.status === 'CANCELLED' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-black uppercase text-xs">Donation Workflow Status: {donation.status}</p>
            <p className="mt-1 font-normal text-xs">
              {donation.status === 'CANCELLED' && 'This donation request was cancelled.'}
              {donation.status === 'REJECTED' && (donation.rejectionReason || 'Did not meet medical screening criteria.')}
              {donation.status === 'DEFERRED' && (donation.deferralReason || 'Temporarily deferred during screening.')}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Status Timeline Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Donation Lifecycle Progress</h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {TIMELINE_STEPS.map((step, idx) => {
            let isPassed = currentStepIdx > idx;
            let isCurrent = currentStepIdx === idx && !isTerminal;

            if (donation.status === 'AVAILABLE') {
              isPassed = true;
              isCurrent = idx === TIMELINE_STEPS.length - 1;
            }

            return (
              <div key={step.key} className="relative flex items-start space-x-4">
                {/* Timeline Icon Node */}
                <div className={`absolute -left-6 top-0 w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isPassed ? 'bg-emerald-500 border-emerald-500 text-white' :
                  isCurrent ? 'bg-blood-600 border-blood-600 text-white ring-4 ring-blood-100 animate-pulse' :
                  'bg-white border-slate-300 text-slate-400'
                }`}>
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> :
                   isCurrent ? <Clock3 className="w-3.5 h-3.5" /> :
                   <span className="text-[10px] font-bold">{idx + 1}</span>}
                </div>

                <div className="pl-3">
                  <p className={`text-xs font-bold ${isCurrent ? 'text-blood-600 font-extrabold text-sm' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-blood-600" />
            <h4 className="font-bold text-slate-800 text-xs">Donation Facility Location</h4>
          </div>
          <p className="text-xs font-semibold text-slate-700">{donation.location}</p>

          {donation.notes && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Notes</span>
              <p className="text-xs text-slate-600 italic mt-0.5">{donation.notes}</p>
            </div>
          )}
        </div>

        {/* Self Declared Health Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-slate-800 text-xs">Self-Declared Health Confirmation</h4>
          </div>
          <p className="text-[11px] text-slate-500 italic">Confirmed good health & no active infection prior to screening.</p>

          {donation.bloodUnitRef && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold">
              <span className="block text-[10px] uppercase text-emerald-600 font-bold">Inventory Unit ID</span>
              <span className="font-mono text-sm block mt-0.5">{donation.bloodUnitRef.unitId || 'Available'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
