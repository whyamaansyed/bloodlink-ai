import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export const IntelligentMatchModal = ({ isOpen, onClose, requestId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      const fetchMatches = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/requests/${requestId}/matches`);
          if (data.success) {
            setData(data);
          }
        } catch (err) {
          console.error('Failed to fetch request matches:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchMatches();
    }
  }, [requestId]);

  if (!requestId) return null;

  const matches = data?.matches || {};
  const req = data?.request || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Intelligent Matching Engine: Ref ${req.patientReference}`} maxWidth="max-w-2xl">
      {loading ? (
        <LoadingSpinner text="Running intelligent compatibility matching algorithm..." />
      ) : (
        <div className="space-y-5">
          {/* Header Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Requested Blood Requirement</span>
              <span className="font-extrabold text-blood-600 text-sm">{req.quantity} unit(s) of {req.bloodGroup} ({req.component})</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium block">Urgency Level</span>
              <span className="font-bold text-slate-800">{req.urgency}</span>
            </div>
          </div>

          {/* Match Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
            matches.matchStatus === 'EXACT_MATCH_AVAILABLE' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            matches.matchStatus === 'COMPATIBLE_MATCH_AVAILABLE' ? 'bg-blue-50 border-blue-200 text-blue-900' :
            'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <Cpu className="w-6 h-6 shrink-0 text-blood-600" />
            <div>
              <h4 className="font-extrabold text-sm">Matching Status: {matches.matchStatus}</h4>
              <p className="text-xs mt-0.5 opacity-90">
                Exact Available: <strong>{matches.stockSummary?.exactAvailable} units</strong> | Total Compatible Available: <strong>{matches.stockSummary?.totalCompatibleAvailable} units</strong>
              </p>
            </div>
          </div>

          {/* Compatible Donor Blood Groups */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medically Compatible Donor Blood Groups:</h4>
            <div className="flex flex-wrap gap-2">
              {matches.compatibleBloodGroups?.map(bg => (
                <span
                  key={bg}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border ${
                    bg === req.bloodGroup
                      ? 'bg-blood-600 text-white border-blood-600 shadow-sm'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {bg} {bg === req.bloodGroup ? '(Exact)' : '(Compatible)'}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Units List */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Inventory Units (FEFO Priority Sorted):</h4>
            {matches.recommendedUnits?.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center bg-slate-50 rounded-xl">No compatible inventory units available at this time.</p>
            ) : (
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl text-xs">
                {matches.recommendedUnits?.map(u => (
                  <div key={u._id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{u.unitId}</span>
                      <span className="ml-2 font-black text-blood-600">{u.bloodGroup}</span>
                      <span className="ml-2 text-slate-500">({u.component})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-500 text-[11px]">Exp: {formatDate(u.expiryDate)} ({u.daysRemaining}d)</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isExactMatch ? 'bg-blood-100 text-blood-800' : 'bg-blue-100 text-blue-800'}`}>
                        {u.isExactMatch ? 'Exact Match' : 'Compatible'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
              Close Matching Engine
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
