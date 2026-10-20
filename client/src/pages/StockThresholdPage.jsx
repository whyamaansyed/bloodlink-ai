import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { SlidersHorizontal, Edit, Check } from 'lucide-react';

export const StockThresholdPage = () => {
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState(null);
  const [minStock, setMinStock] = useState(10);
  const [critStock, setCritStock] = useState(5);

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/thresholds');
      if (data.success) {
        setThresholds(data.thresholds);
      }
    } catch (err) {
      console.error('Failed to fetch thresholds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThresholds();
  }, []);

  const handleOpenModal = (item) => {
    setEditingItem(item);
    setMinStock(item.minimumStock);
    setCritStock(item.criticalStock);
  };

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    if (Number(critStock) > Number(minStock)) {
      alert('Critical stock cannot exceed minimum stock threshold.');
      return;
    }
    try {
      await api.put(`/thresholds/${editingItem._id}`, {
        minimumStock: Number(minStock),
        criticalStock: Number(critStock)
      });
      setEditingItem(null);
      fetchThresholds();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating threshold');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Threshold Rules Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">Configure custom minimum and critical stock safety thresholds per blood group and component</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching threshold configurations..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Blood Group</th>
                  <th className="px-6 py-4">Component</th>
                  <th className="px-6 py-4">Minimum Threshold</th>
                  <th className="px-6 py-4">Critical Threshold</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {thresholds.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-black text-blood-600 text-sm">{t.bloodGroup}</td>
                    <td className="px-6 py-4">{t.component}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{t.minimumStock} units</td>
                    <td className="px-6 py-4 font-bold text-red-600">{t.criticalStock} units</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenModal(t)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center space-x-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Threshold</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingItem && (
        <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title={`Configure Threshold: ${editingItem.bloodGroup} (${editingItem.component})`}>
          <form onSubmit={handleSaveThreshold} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Stock Threshold (Units)</label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Triggers a Low Stock Warning when available inventory drops below this number.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Critical Stock Threshold (Units)</label>
              <input
                type="number"
                min="0"
                value={critStock}
                onChange={(e) => setCritStock(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Triggers an Emergency Critical Alert when available inventory drops to or below this number.</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-blood-600 hover:bg-blood-700 text-white rounded-lg shadow-sm"
              >
                Save Thresholds
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
