import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import {
  Droplet,
  HeartHandshake,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Eye,
  PlusCircle
} from 'lucide-react';

export const DonorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/dashboard/summary');
        if (data.success) setData(data);
      } catch (err) {
        console.error('Failed to fetch donor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonorDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading Donor Portal..." />;

  const kpis = data?.kpis || {};
  const activeDonation = data?.activeDonation || null;
  const history = data?.donations || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Welcome & Donate Blood CTA Banner */}
      <div className="bg-gradient-to-r from-blood-600 via-blood-700 to-blood-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-blood-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            BLOODLINK AI Donor Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Thank you for saving lives!</h1>
          <p className="text-xs text-blood-100 mt-1 max-w-lg">
            Your verified blood group is <span className="font-extrabold text-white underline">{kpis.bloodGroup || 'O+'}</span>. Schedule a voluntary donation appointment today.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3 shrink-0">
          <Link
            to="/donor/donate"
            className="px-6 py-3.5 bg-white text-blood-700 hover:bg-blood-50 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            <HeartHandshake className="w-5 h-5 text-blood-600" />
            <span>Donate Blood Now</span>
          </Link>
        </div>
      </div>

      {/* Donor KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Blood Group" value={kpis.bloodGroup || 'O+'} icon={Droplet} color="red" />
        <StatCard title="Completed Donations" value={kpis.totalDonations || 0} icon={HeartHandshake} color="emerald" />
        <StatCard title="Pending Requests" value={kpis.pendingCount || 0} icon={Clock} color="blue" />
        <StatCard title="Eligibility Status" value={kpis.eligibilityStatus || 'ELIGIBLE'} icon={CheckCircle2} color="purple" />
      </div>

      {/* Upcoming / Active Appointment Card */}
      {activeDonation && (
        <div className="bg-white rounded-2xl border border-blood-200 p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-blood-600" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blood-600 animate-pulse" />
              <h3 className="font-bold text-slate-800 text-sm">Active Donation Appointment</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blood-100 text-blood-800 border border-blood-200">
              {activeDonation.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Donation ID</span>
              <span className="font-mono font-bold text-slate-800">{activeDonation.donationId}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Scheduled Date & Time</span>
              <span className="font-bold text-slate-800">{formatDate(activeDonation.preferredDate)} ({activeDonation.preferredTime})</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Facility Location</span>
              <span className="font-bold text-slate-800 truncate block">{activeDonation.location}</span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Link
              to={`/donor/donations/${activeDonation._id}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
            >
              <span>Track Donation Progress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Donation History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Your Recent Blood Donation Requests</h3>
          <Link to="/donor/donations" className="text-xs font-bold text-blood-600 hover:underline">
            View All
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="py-8 px-4 text-center space-y-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">No donation requests recorded yet.</p>
            <Link
              to="/donor/donate"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blood-600 text-white text-xs font-bold rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule First Donation</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Donation ID</th>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Donation Type</th>
                  <th className="px-4 py-3">Preferred Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {history.slice(0, 5).map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{h.donationId || h.unitId}</td>
                    <td className="px-4 py-3 font-bold text-blood-600">{h.bloodGroup}</td>
                    <td className="px-4 py-3">{h.donationType || h.component || 'Whole Blood'}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(h.preferredDate || h.collectionDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        h.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                        h.status === 'CANCELLED' || h.status === 'REJECTED' ? 'bg-slate-100 text-slate-600' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/donor/donations/${h._id}`}
                        className="inline-flex items-center space-x-1 text-blood-600 font-bold hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
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
