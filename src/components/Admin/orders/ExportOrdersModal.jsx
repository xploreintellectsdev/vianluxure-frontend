import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const ALL_COLUMNS = [
    "Order No",
    "Date",
    "Customer Name",
    "Mobile",
    "Email",
    "Shipping Address",
    "Subtotal (₹)",
    "Shipping Fee (₹)",
    "Grand Total (₹)",
    "Order Status",
    "Payment Status",
    "Payment Mode",
    "Transaction ID",
    "Carrier",
    "AWB Number",
    "Shipment Status",
    "Tracking URL"
];

export default function ExportOrdersModal({ isOpen, onClose, onExport, exporting }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedColumns, setSelectedColumns] = useState(["Order No"]);

    if (!isOpen) return null;

    const handleToggleColumn = (col) => {
        if (col === "Order No") return; // Mandatory
        setSelectedColumns(prev => 
            prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
        );
    };

    const handleExportClick = () => {
        onExport({ startDate, endDate, selectedColumns });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-serif font-bold text-slate-900">Export Orders Data</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Date (Optional)</h3>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Columns to Export</h3>
                        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                            {ALL_COLUMNS.map(col => {
                                const isMandatory = col === "Order No";
                                const isSelected = selectedColumns.includes(col);
                                return (
                                    <label 
                                        key={col} 
                                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                            isSelected ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:bg-gray-50'
                                        } ${isMandatory ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                                        }`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-700 leading-tight select-none">{col}</span>
                                        <input 
                                            type="checkbox" 
                                            className="hidden"
                                            checked={isSelected}
                                            onChange={() => handleToggleColumn(col)}
                                            disabled={isMandatory}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleExportClick}
                        disabled={exporting}
                        className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        {exporting ? 'Exporting...' : 'Download Excel'}
                    </button>
                </div>
            </div>
        </div>
    );
}
