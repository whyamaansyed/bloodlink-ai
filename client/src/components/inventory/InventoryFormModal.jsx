import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/constants';

export const InventoryFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    bloodGroup: initialData?.bloodGroup || 'O+',
    component: initialData?.component || 'Whole Blood',
    quantity: initialData?.quantity || 1,
    collectionDate: initialData?.collectionDate ? initialData.collectionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    expiryDate: initialData?.expiryDate ? initialData.expiryDate.slice(0, 10) : new Date(Date.now() + 35 * 86400000).toISOString().slice(0, 10),
    storageLocation: initialData?.storageLocation || 'Freezer A-1'
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.expiryDate) <= new Date(formData.collectionDate)) {
      setError('Expiry date must be logically later than collection date.');
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Blood Unit' : 'Add Blood Unit'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Units)</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Storage Location</label>
            <input
              type="text"
              name="storageLocation"
              value={formData.storageLocation}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
              placeholder="e.g. Freezer A-1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Collection Date</label>
            <input
              type="date"
              name="collectionDate"
              value={formData.collectionDate}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
              required
            />
          </div>
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
            Save Blood Unit
          </button>
        </div>
      </form>
    </Modal>
  );
};
