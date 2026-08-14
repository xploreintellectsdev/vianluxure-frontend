import { Edit3, Trash2, PlusCircle, Eye, ExternalLink, Loader2, RotateCcw } from 'lucide-react';
import { Tooltip } from '@mui/material';

export const getFabricColumns = ({ onEdit, onDelete, onView, onOpenPage, onAddVariant, editLoadingId, onRestore, isTrash }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  
  return [
    {
      id: 'fab_cover_image',
      label: 'Image',
      render: (row) => (
        <img src={`${API_URL}${row.fab_cover_image}`} className="w-12 h-12 rounded-lg object-cover border border-slate-100" alt="fab" />
      ),
    },
    { id: 'fab_group_code', label: 'Group', render: (row) => <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{row.fab_group_code}</span> },
    { id: 'fab_name', label: 'Name', render: (row) => <span className="text-sm font-bold text-slate-800">{row.fab_name}</span> },
    { id: 'fc_name', label: 'Category', render: (row) => <span className="text-xs font-semibold text-slate-500">{row.fc_name || '—'}</span> },
    { id: 'fab_price_per_meter', label: 'Price', render: (row) => <span className="text-sm font-bold text-slate-900">₹{row.fab_price_per_meter}</span> },
    { id: 'stock_quantity', label: 'Stock (Meters)', render: (row) => <span className={`text-xs font-semibold px-2 py-1 rounded-full ${Number(row.stock_quantity) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>{row.stock_quantity || 0} m</span> },
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => isTrash ? (
        <Tooltip title="Restore Record">
          <button
            onClick={() => onRestore(row)}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg border border-emerald-200 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Restore</span>
          </button>
        </Tooltip>
      ) : (
        <div className="flex gap-3 text-slate-400">
          <Tooltip title="Quick View"><button onClick={() => onView(row)} className="hover:text-blue-600"><Eye size={18} /></button></Tooltip>
          <Tooltip title="Open Full Page"><button onClick={() => onOpenPage(row)} className="hover:text-purple-600"><ExternalLink size={18} /></button></Tooltip>
          <Tooltip title="Edit">
            <button onClick={() => onEdit(row)} disabled={editLoadingId === row.fab_id} className="hover:text-slate-800 disabled:opacity-50">
              {editLoadingId === row.fab_id ? <Loader2 size={18} className="animate-spin" /> : <Edit3 size={18} />}
            </button>
          </Tooltip>
          <Tooltip title="Delete"><button onClick={() => onDelete(row)} className="hover:text-red-600"><Trash2 size={18} /></button></Tooltip>
        </div>
      ),
    },
  ];
};