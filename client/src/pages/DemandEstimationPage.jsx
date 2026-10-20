import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { LineChart, Info, AlertCircle, HelpCircle } from 'lucide-react';

export const DemandEstimationPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimations = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/demand/estimate');
        if (data.success) {
          setData(data);
        }
      } catch (err) {
        console.error('Failed to fetch demand estimation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEstimations();
  }, []);

  if (loading) return <LoadingSpinner text="Computing demand estimations..." />;

  const methodology = data?.methodology || {};
  const estimates = data?.estimates || [];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Future Demand Estimation Engine</h1>
          <p className="text-xs text-slate-500 mt-1">Statistical supply chain forecasting to assist blood bank inventory replenishment planning</p>
        </div>
      </div>

      {/* Methodology & Disclaimer Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
          <Info className="w-5 h-5 text-blue-600" />
          <span>Methodology: {methodology.name || 'Weighted Moving Average (WMA)'}</span>
        </div>
        <p className="text-xs text-blue-800 leading-relaxed">{methodology.description}</p>
        <div className="p-3 bg-white/80 rounded-xl text-[11px] text-slate-600 border border-blue-100 font-medium">
          <strong>Medical & Clinical Disclaimer:</strong> {methodology.disclaimer}
        </div>
      </div>

      {!data?.hasData ? (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-amber-900">Insufficient Historical Data</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            Insufficient historical data for reliable estimation. Demand estimation requires at least 1 month of recorded request history.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Estimated Blood Unit Demand for Next Period</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Blood Group</th>
                  <th className="px-6 py-3.5">Historical Monthly Avg</th>
                  <th className="px-6 py-3.5">Estimated Next Period</th>
                  <th className="px-6 py-3.5">Sample Window</th>
                  <th className="px-6 py-3.5">Confidence Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {estimates.map((item) => (
                  <tr key={item.bloodGroup} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-black text-blood-600 text-base">{item.bloodGroup}</td>
                    <td className="px-6 py-4 text-slate-700">{item.historicalAverage} units/month</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 text-base">
                      {item.estimatedNextPeriod} <span className="text-xs font-normal text-slate-500">units</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{item.sampleMonthsCount} month(s)</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {item.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
