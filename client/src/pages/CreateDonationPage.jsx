import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { HeartHandshake, Calendar, Clock, MapPin, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, UserCheck, Building2 } from 'lucide-react';

export const CreateDonationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [donorProfile, setDonorProfile] = useState(null);
  const [activeDonation, setActiveDonation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('09:00 AM - 11:00 AM');
  const [location, setLocation] = useState('');
  const [donationType, setDonationType] = useState('Whole Blood');
  const [notes, setNotes] = useState('');

  // Health Declaration Checklist
  const [health, setHealth] = useState({
    feelingWell: true,
    noRecentIllness: true,
    noRecentMedication: true,
    noRecentSurgery: true,
    noRecentTattoo: true,
    accurateInfoConfirmed: false
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [dashRes, hospRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/hospitals')
        ]);

        if (dashRes.data?.success) {
          setDonorProfile(dashRes.data.donorProfile);
          if (dashRes.data.activeDonation) {
            setActiveDonation(dashRes.data.activeDonation);
          }
        }

        if (hospRes.data?.success && Array.isArray(hospRes.data.hospitals)) {
          setHospitals(hospRes.data.hospitals);
          if (hospRes.data.hospitals.length > 0) {
            const first = hospRes.data.hospitals[0];
            setSelectedHospitalId(first._id);
            setLocation(`${first.hospitalName}, ${first.city}`);
          }
        }
      } catch (err) {
        console.error('Failed to load initial data for donation creation:', err);
        setError('Failed to load hospital or donor profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleHealthCheck = (key) => {
    setHealth(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedHospitalId) {
      setError('Please select a target hospital for your blood donation.');
      return;
    }

    if (!health.accurateInfoConfirmed) {
      setError('Please confirm that the information provided is accurate before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        hospitalId: selectedHospitalId,
        preferredDate,
        preferredTime,
        location,
        donationType,
        healthDeclaration: health,
        notes
      };

      const { data } = await api.post('/donations', payload);
      if (data.success) {
        navigate(`/donor/donations/${data.donation._id}`);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError('You already have an active donation request. Please view or complete your current request.');
        if (err.response.data?.activeDonationId) {
          setActiveDonation({ _id: err.response.data.activeDonationId, status: err.response.data.status });
        }
      } else {
        setError(err.response?.data?.message || 'Failed to submit donation request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Preparing Blood Donation Form..." />;

  // Active Request Guard UI
  if (activeDonation) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-900">Active Donation Request Exists</h2>
            <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
              You already have an active blood donation request in progress (Status: <span className="font-extrabold underline">{activeDonation.status}</span>). Please complete or cancel your existing request before submitting a new one.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to={`/donor/donations/${activeDonation._id}`}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105"
            >
              <span>View Existing Donation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blood-600 to-blood-800 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blood-200">BLOODLINK AI Donor Portal</span>
          <h1 className="text-2xl font-black mt-1">Schedule a Blood Donation</h1>
          <p className="text-xs text-blood-100 mt-1">Your voluntary donation saves up to 3 emergency patient lives.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-white">
          <HeartHandshake className="w-7 h-7" />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Donor Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-blood-600" />
            <h2 className="font-bold text-slate-800 text-sm">1. Verified Donor Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Full Name</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{user?.name}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Blood Group</span>
              <span className="font-black text-blood-600 text-sm mt-0.5 block">{donorProfile?.bloodGroup || 'O+'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Contact Phone</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{user?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Self-Declared Health Declaration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="font-bold text-slate-800 text-sm">2. Self-Declared Health Screening</h2>
              <p className="text-[11px] text-slate-500">Self-declared information — final medical eligibility is determined by authorized blood bank personnel at screening.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={health.feelingWell}
                onChange={() => handleHealthCheck('feelingWell')}
                className="mt-0.5 rounded text-blood-600 focus:ring-blood-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">I am feeling well and in good health today.</span>
            </label>

            <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={health.noRecentIllness}
                onChange={() => handleHealthCheck('noRecentIllness')}
                className="mt-0.5 rounded text-blood-600 focus:ring-blood-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">I have no fever, active infection, or contagious illness in the past 14 days.</span>
            </label>

            <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={health.noRecentMedication}
                onChange={() => handleHealthCheck('noRecentMedication')}
                className="mt-0.5 rounded text-blood-600 focus:ring-blood-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">I am not currently taking antibiotics or blood thinning medication.</span>
            </label>

            <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={health.noRecentTattoo}
                onChange={() => handleHealthCheck('noRecentTattoo')}
                className="mt-0.5 rounded text-blood-600 focus:ring-blood-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">I have not had a tattoo or body piercing in the past 6 months.</span>
            </label>
          </div>
        </div>

        {/* Section 3: Target Hospital & Appointment Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-blood-600" />
            <h2 className="font-bold text-slate-800 text-sm">3. Select Target Hospital & Appointment Preference</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Hospital <span className="text-blood-600">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedHospitalId}
                  onChange={(e) => {
                    setSelectedHospitalId(e.target.value);
                    const selected = hospitals.find(h => h._id === e.target.value);
                    if (selected) {
                      setLocation(`${selected.hospitalName}, ${selected.city}`);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-blood-500 focus:border-blood-500"
                  required
                >
                  <option value="">-- Select Target Hospital --</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.hospitalName} ({h.city})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Your donation request will be routed directly to this hospital's Blood Donation Portal.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Donation Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-blood-500 focus:border-blood-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Slot</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-blood-500 focus:border-blood-500"
                    required
                  >
                    <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Donation Type</label>
                <select
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-blood-500 focus:border-blood-500"
                >
                  <option value="Whole Blood">Whole Blood (Standard)</option>
                  <option value="Packed Red Blood Cells">Packed Red Blood Cells (RBC)</option>
                  <option value="Plasma">Plasma</option>
                  <option value="Platelets">Platelets (Apheresis)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Donation Location Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Hospital unit location..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-blood-500 focus:border-blood-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Optional Notes for Medical Staff</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special notes or preferences..."
                rows={2}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-blood-500 focus:border-blood-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Consent & Submission */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <label className="flex items-start space-x-3 p-3 rounded-xl bg-blood-50/50 border border-blood-200/60 cursor-pointer">
            <input
              type="checkbox"
              checked={health.accurateInfoConfirmed}
              onChange={() => handleHealthCheck('accurateInfoConfirmed')}
              className="mt-0.5 rounded text-blood-600 focus:ring-blood-500 w-4 h-4"
              required
            />
            <span className="text-xs text-blood-900 font-bold">
              I confirm that the health information provided is accurate to the best of my knowledge and I consent to undergo blood bank medical screening at the selected hospital.
            </span>
          </label>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Link
              to="/donor/dashboard"
              className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !health.accurateInfoConfirmed || !selectedHospitalId}
              className="px-8 py-3.5 bg-gradient-to-r from-blood-600 to-blood-500 hover:from-blood-500 hover:to-blood-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_8px_20px_rgb(239,68,68,0.25)] hover:shadow-[0_12px_25px_rgb(239,68,68,0.35)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {submitting ? 'Submitting Request...' : 'Submit Donation Request'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
