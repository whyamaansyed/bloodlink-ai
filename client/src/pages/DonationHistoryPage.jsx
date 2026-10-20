import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { History, HeartHandshake, ArrowRight, Eye, Calendar, MapPin } from 'lucide-react';

export const DonationHistoryPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/donations/my');
        if (data.success) {
          setDonations(data.donations || []);
        }
      } catch (err) {
        console.error('Failed to fetch donation history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching donation records..." />;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Your Donation History</h1>
          <p className="text-xs text-slate-500 mt-1">Track your voluntary blood donation requests, appointments, and processing status</p>
        </div>
        <Link
          to="/donor/donate"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blood-600 to-blood-500 hover:from-blood-500 hover:to-blood-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Donate Blood</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {donations.length === 0 ? (
          <div className="py-12 px-6 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 bg-blood-50 text-blood-500 rounded-2xl flex items-center justify-center mx-auto">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No blood donations yet</h3>
              <p className="text-xs text-slate-500 mt-1">Your voluntary blood donation can help save up to three emergency patient lives.</p>
            </div>
            <div>
              <Link
                to="/donor/donate"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                <span>Donate Blood Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Donation ID</th>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Donation Type</th>
                  <th className="px-4 py-3">Scheduled Date</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{d.donationId}</td>
                    <td className="px-4 py-3 font-black text-blood-600">{d.bloodGroup}</td>
                    <td className="px-4 py-3 text-slate-700">{d.donationType || 'Whole Blood'}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(d.preferredDate)} ({d.preferredTime})</td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">{d.location}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        d.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        d.status === 'CANCELLED' || d.status === 'REJECTED' ? 'bg-slate-100 text-slate-600 border border-slate-300' :
                        'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/donor/donations/${d._id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
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
