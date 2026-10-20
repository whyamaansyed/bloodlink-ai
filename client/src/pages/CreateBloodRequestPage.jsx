import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../utils/constants';

export const CreateBloodRequestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientReference: '',
    bloodGroup: 'O+',
    component: 'Whole Blood',
    quantity: 1,
    urgency: 'NORMAL',
    requiredDate: new Date().toISOString().slice(0, 10),
    reason: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/requests', formData);
      navigate('/hospital/my-requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Submit New Blood Request 🩸</h1>
        <p className="text-xs text-slate-500 mt-1">Submit blood requirements to central blood bank repository</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Patient Reference / Medical ID</label>
            <input
              type="text"
              name="patientReference"
              value={formData.patientReference}
              onChange={handleChange}
              placeholder="e.g. PAT-2026-8802"
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 font-bold text-blood-600"
              >
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Component Type</label>
              <select
                name="component"
                value={formData.component}
                onChange={handleChange}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5"
              >
                {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Units)</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Level</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 font-bold"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENCY">🚨 EMERGENCY</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Required By Date</label>
            <input
              type="date"
              name="requiredDate"
              value={formData.requiredDate}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Medical Diagnosis / Reason</label>
            <textarea
              name="reason"
              rows="3"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g. Scheduled open heart surgery / Trauma emergency..."
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold bg-blood-600 hover:bg-blood-700 text-white rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
