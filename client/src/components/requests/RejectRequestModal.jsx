import React, { useState } from 'react';
import { Modal } from '../common/Modal';

export const RejectRequestModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    onConfirm(reason);
    onClose();
    setReason('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Blood Request" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection</label>
          <textarea
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Specify why this request cannot be fulfilled (e.g. Stock unavailable, Invalid details)..."
            className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-blood-500 focus:border-blood-500"
            required
          />
        </div>
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
          >
            Confirm Rejection
          </button>
        </div>
      </form>
    </Modal>
  );
};
