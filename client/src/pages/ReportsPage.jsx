import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Printer, Download, FileText, Filter } from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/formatters';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('inventory');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await api.get(`/reports/${reportType}`, { params });
      if (data.success) {
        setReportData(data);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (!reportData?.data || reportData.data.length === 0) return;
    const items = reportData.data;
    const headers = Object.keys(items[0]).join(',');
    const rows = items.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SMART_BLOOD_BANK_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System Audit & Operational Reports</h1>
          <p className="text-xs text-slate-500 mt-1">Generate print-ready documents and export database CSV reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs & Date Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between no-print">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'inventory', label: 'Inventory' },
            { id: 'donations', label: 'Donations' },
            { id: 'requests', label: 'Requests' },
            { id: 'demand', label: 'Demand' },
            { id: 'expiry', label: 'Expiry Risk' },
            { id: 'low-stock', label: 'Low Stock' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                reportType === tab.id
                  ? 'bg-blood-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-300 rounded-lg p-1.5"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-slate-300 rounded-lg p-1.5"
          />
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-none">
        <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{reportData?.reportTitle || 'Report'}</h2>
            <p className="text-xs text-slate-500 mt-1">SMART BLOOD BANK — Official Operational Document</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Generated: {formatDateTime(reportData?.generatedAt)}</p>
            <p>Total Records: {reportData?.count || 0}</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Generating database report..." />
        ) : (!reportData?.data || reportData.data.length === 0) ? (
          <p className="p-8 text-center text-slate-400 text-sm">No records found for the selected date range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                  {Object.keys(reportData.data[0]).map((key) => (
                    <th key={key} className="px-4 py-3">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {Object.values(row).map((val, vIdx) => (
                      <td key={vIdx} className="px-4 py-3 whitespace-nowrap">
                        {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? 'N/A')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
