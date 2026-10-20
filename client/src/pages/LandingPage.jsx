import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Droplet,
  ShieldCheck,
  Activity,
  LineChart,
  Bell,
  ArrowRight,
  CheckCircle,
  Hospital,
  HeartHandshake,
  Clock,
  AlertTriangle,
  FileText,
  Zap,
  CheckCircle2,
  MapPin,
  Send,
  Sliders,
  History,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { BLOOD_GROUPS } from '../utils/constants';

const HT03_FEATURES = [
  { id: 1, title: 'Real-time blood inventory dashboard', icon: Activity, desc: 'Dynamic calculations direct from active non-expired database records.' },
  { id: 2, title: 'Blood-group-wise stock tracking', icon: Droplet, desc: 'Matrix display across all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-) & 4 components.' },
  { id: 3, title: 'Donation and donor management', icon: HeartHandshake, desc: 'Full voluntary donor directory, eligibility tracking, and donor donation workflow.' },
  { id: 4, title: 'Blood unit expiry-date monitoring', icon: Clock, desc: 'FEFO sweep calculating days until expiry, categorizing Expired, Critical, Warning, and Normal.' },
  { id: 5, title: 'Automatic alerts for low-stock and near-expiry units', icon: AlertTriangle, desc: 'Configurable StockThreshold evaluation triggering instant system notifications.' },
  { id: 6, title: 'Hospital/blood request management', icon: FileText, desc: 'Multi-stage lifecycle (PENDING ➔ APPROVED / REJECTED ➔ FULFILLED).' },
  { id: 7, title: 'Emergency blood requirement registration', icon: Zap, desc: 'EMERGENCY 🚨 urgency tag with priority queue ranking and visual highlight.' },
  { id: 8, title: 'Intelligent matching of requests with compatible units', icon: CheckCircle2, desc: 'RBC & Plasma compatibility matrix evaluation for requested blood group vs inventory.' },
  { id: 9, title: 'Nearby blood-bank discovery', icon: MapPin, desc: 'Dedicated Discovery page (/nearby-blood-banks) with location, distance calculation, & hotline.' },
  { id: 10, title: 'Emergency donor notification system', icon: Send, desc: 'Automatic broadcast of notifications to eligible matching donors when emergency requests occur.' },
  { id: 11, title: 'Request priority management', icon: Sliders, desc: 'Priority Queue Ranking score (urgencyWeight + hoursPending * 2).' },
  { id: 12, title: 'Blood unit movement & transaction history', icon: History, desc: 'BloodUnitTransaction audit trail recording DONATED ➔ AVAILABLE ➔ RESERVED ➔ ISSUED.' },
  { id: 13, title: 'Admin dashboard with demand & inventory analytics', icon: TrendingUp, desc: 'Recharts analytics suite with multi-dimensional interactive charts.' },
  { id: 14, title: 'Reports for high-demand blood groups & shortage trends', icon: FileSpreadsheet, desc: 'Audit reports with date range filtering, print-friendly layouts, and CSV export.' }
];

export const LandingPage = () => {
  const [stockSummary, setStockSummary] = useState(null);

  useEffect(() => {
    const fetchPublicStock = async () => {
      try {
        const { data } = await api.get('/inventory/summary');
        if (data.success) {
          setStockSummary(data.summary);
        }
      } catch (err) {
        console.error('Could not fetch public stock summary:', err);
      }
    };
    fetchPublicStock();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-blood-900/40 via-slate-900 to-slate-950"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blood-600/30 border border-blood-500/40 text-blood-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Activity className="w-3.5 h-3.5 text-blood-400 animate-pulse" />
              <span>HT-03 Smart Blood Bank Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              BLOODLINK <span className="text-blood-500">AI</span>
            </h1>
            <p className="text-xl font-bold text-slate-300 mt-2">
              HT-03 Smart Blood Bank Demand & Inventory Management System
            </p>
            <p className="text-sm text-slate-400 mt-6 leading-relaxed">
              Empowering blood bank staff, hospitals, and voluntary donors with centralized FEFO inventory allocation, intelligent compatibility matching, emergency donor notifications, and real-time demand analytics.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="px-6 py-3.5 bg-blood-600 hover:bg-blood-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blood-900/50 flex items-center space-x-2 transition-all hover:scale-105"
              >
                <span>Access System Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Register Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Inventory Preview Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-blood-600 fill-current" />
              <span>Live Available Blood Units Overview</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Dynamically Calculated Direct from Database</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BLOOD_GROUPS.map((bg) => {
              const count = stockSummary?.byBloodGroup?.[bg] ?? '—';
              return (
                <div key={bg} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="font-black text-blood-600 text-base block">{bg}</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block">{count} units</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HT-03 All 14 Key Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black text-blood-600 uppercase tracking-widest bg-blood-50 px-3 py-1 rounded-full border border-blood-200">
            HT-03 Requirements Coverage
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">HT-03 Key Features & Capabilities</h2>
          <p className="text-slate-500 mt-2 text-xs font-medium">
            Providing real-time visibility of blood stock and intelligently coordinating donors, blood banks, hospitals, and emergency requests.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HT03_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-blood-50 border border-blood-100 rounded-xl flex items-center justify-center text-blood-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Feature #{feat.id}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
