import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/constants';

export const CreateRequestModal = ({ isOpen, onClose, onSubmit }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.patientReference || !formData.reason) {
      setError('Patient Reference and Medical Reason are required.');
      return;
    }

    if (formData.quantity < 1) {
      setError('Quantity must be at least 1 unit.');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit New Blood Request 🩸" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Patient Reference / ID</label>
          <input
            type="text"
            name="patientReference"
            value={formData.patientReference}
            onChange={handleChange}
            placeholder="e.g. PAT-2026-9041"
            className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
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
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
            >
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Component</label>
            <select
              name="component"
              value={formData.component}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
            >
              {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Needed (Units)</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Level</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500 font-semibold text-slate-800"
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
            className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Medical Reason / Notes</label>
          <textarea
            name="reason"
            rows="3"
            value={formData.reason}
            onChange={handleChange}
            placeholder="e.g. Emergency trauma procedure / Scheduled heart surgery..."
            className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold bg-blood-600 hover:bg-blood-700 text-white rounded-lg shadow-sm"
          >
            Submit Blood Request
          </button>
        </div>
      </form>
    </Modal>
  );
};
