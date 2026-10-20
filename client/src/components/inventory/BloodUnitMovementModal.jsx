import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import { History, ArrowRight, User, CheckCircle2 } from 'lucide-react';

export const BloodUnitMovementModal = ({ isOpen, onClose, unit }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (unit?._id) {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/inventory/${unit._id}/history`);
          if (data.success) {
            setHistory(data.history);
          }
        } catch (err) {
          console.error('Failed to fetch unit history:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [unit]);

  if (!unit) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Movement & Audit History: ${unit.unitId}`} maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div>
            <span className="text-slate-500 block">Blood Group & Component</span>
            <span className="font-extrabold text-blood-600 text-sm">{unit.bloodGroup} ({unit.component})</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Current Location</span>
            <span className="font-bold text-slate-800">{unit.storageLocation}</span>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching movement audit trail..." />
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400 p-6 text-center bg-slate-50 rounded-xl">No previous movement records found for this unit.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((tx, idx) => (
              <div key={tx._id || idx} className="relative text-xs">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blood-600 text-white flex items-center justify-center font-bold text-[10px] ring-4 ring-white">
                  ✓
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wide">{tx.action}</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(tx.createdAt)}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600 font-medium">
                    <span>{tx.statusFrom || 'NEW'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-blood-600">{tx.statusTo}</span>
                  </div>

                  {tx.notes && <p className="text-slate-500 text-[11px] italic mt-1">{tx.notes}</p>}

                  {tx.performedBy && (
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <User className="w-3 h-3" />
                      <span>Action by {tx.performedBy.name} ({tx.performedBy.role})</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
            Close History
          </button>
        </div>
      </div>
    </Modal>
  );
};
