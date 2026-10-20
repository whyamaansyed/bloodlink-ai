import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable } from '../components/common/DataTable';
import { SearchBar } from '../components/common/SearchBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { InventoryFormModal } from '../components/inventory/InventoryFormModal';
import { BloodUnitMovementModal } from '../components/inventory/BloodUnitMovementModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../utils/constants';
import { Plus, Trash2, Edit, RefreshCw, History } from 'lucide-react';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [historyUnit, setHistoryUnit] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGroup) params.bloodGroup = selectedGroup;
      if (selectedComponent) params.component = selectedComponent;
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;

      const { data } = await api.get('/inventory', { params });
      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedGroup, selectedComponent, selectedStatus, search]);

  const handleSaveUnit = async (formData) => {
    try {
      if (editingUnit) {
        await api.put(`/inventory/${editingUnit._id}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving blood unit');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/inventory/${deleteId}`);
      fetchInventory();
    } catch (err) {
      alert('Failed to delete blood unit');
    }
  };

  const columns = [
    { header: 'Unit ID', key: 'unitId', render: (row) => <span className="font-bold text-slate-800 font-mono text-xs">{row.unitId}</span> },
    { header: 'Blood Group', key: 'bloodGroup', render: (row) => <span className="font-extrabold text-blood-600">{row.bloodGroup}</span> },
    { header: 'Component', key: 'component' },
    { header: 'Qty', key: 'quantity', render: (row) => <span className="font-bold">{row.quantity}</span> },
    { header: 'Collection Date', key: 'collectionDate', render: (row) => formatDate(row.collectionDate) },
    { header: 'Expiry Date', key: 'expiryDate', render: (row) => (
      <div>
        <p className="font-medium text-slate-800">{formatDate(row.expiryDate)}</p>
        <span className="text-[10px] text-slate-400 font-bold">{row.daysRemaining}d remaining</span>
      </div>
    )},
    { header: 'Storage Location', key: 'storageLocation' },
    { header: 'Status', key: 'status', render: (row) => <StatusBadge type="inventory" status={row.status} /> },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setHistoryUnit(row)}
            className="p-1 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded"
            title="View Movement Audit Log"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setEditingUnit(row); setModalOpen(true); }}
            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
            title="Edit Unit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row._id)}
            className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded"
            title="Delete Unit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Blood Inventory Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage physical blood units, storage locations, expiration tracking, and movement audit logs</p>
        </div>
        <button
          onClick={() => { setEditingUnit(null); setModalOpen(true); }}
          className="px-4 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Blood Unit</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search Unit ID or Storage..." />

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          <select
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Components</option>
            {BLOOD_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="RESERVED">RESERVED</option>
            <option value="ISSUED">ISSUED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>

          <button onClick={fetchInventory} className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching inventory records..." />
      ) : (
        <DataTable
          columns={columns}
          data={inventory}
          itemsPerPage={10}
          emptyTitle="No inventory units found"
          emptyDescription="Try adjusting your filters or add a new blood unit."
        />
      )}

      {modalOpen && (
        <InventoryFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSaveUnit}
          initialData={editingUnit}
        />
      )}

      {historyUnit && (
        <BloodUnitMovementModal
          isOpen={!!historyUnit}
          onClose={() => setHistoryUnit(null)}
          unit={historyUnit}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Blood Unit"
          message="Are you sure you want to delete this blood unit from physical inventory? This action cannot be undone."
          confirmText="Delete Unit"
        />
      )}
    </div>
  );
};
