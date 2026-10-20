import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../utils/constants';
import { getCompatibleDonorGroups } from '../../utils/compatibilityMatrix';
import { Info, ShieldAlert } from 'lucide-react';

export const CompatibilityMatrixModal = ({ isOpen, onClose }) => {
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [selectedComponent, setSelectedComponent] = useState('Packed Red Blood Cells');

  const compatibleDonors = getCompatibleDonorGroups(selectedGroup, selectedComponent);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Blood Group Compatibility Lookup (Informational)" maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p>
            <strong>Informational Guidance:</strong> Blood compatibility depends on blood component type (RBC vs. Plasma). In clinical practice, laboratory cross-matching is always required.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Patient Blood Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-bold text-blood-600"
            >
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Blood Component</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5"
            >
              {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Compatible Donor Blood Groups for Patient ({selectedGroup} - {selectedComponent}):
          </h4>

          <div className="flex flex-wrap gap-2">
            {compatibleDonors.map(bg => (
              <span key={bg} className="px-3.5 py-2 bg-emerald-100 border border-emerald-300 text-emerald-900 text-sm font-black rounded-lg shadow-xs">
                {bg}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Close Lookup
          </button>
        </div>
      </div>
    </Modal>
  );
};
