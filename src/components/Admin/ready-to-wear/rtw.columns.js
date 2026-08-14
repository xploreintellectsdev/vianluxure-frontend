import { Edit3, Trash2, RotateCcw } from 'lucide-react';
import { Tooltip } from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const getRtwColumns = ({ onEdit, onDelete, onRestore, isTrash }) => [
  {
    id: 'sno',
    label: 'S.No',
    render: (row, sno) => <span className="text-sm font-semibold text-slate-500">{sno}</span>,
  },
  {
    id: 'rtw_cover_image',
    label: 'Image',
    render: (row) => (
      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
        {row.rtw_cover_image ? (
          <img src={`${API_URL}${row.rtw_cover_image}`} alt={row.rtw_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-400 font-bold text-xs uppercase">N/A</span>
        )}
      </div>
    ),
  },
  { id: 'rtw_name', label: 'Item Name', render: (row) => <span className="text-sm font-bold text-slate-800">{row.rtw_name}</span> },
  { id: 'fab_name', label: 'Base Fabric', render: (row) => <span className="text-xs font-semibold text-slate-500">{row.fab_name || '—'}</span> },
  { id: 'rtw_price', label: 'Price', render: (row) => <span className="text-sm font-bold text-slate-900">₹{row.rtw_price}</span> },
  { id: 'stock_quantity', label: 'Stock (Pieces)', render: (row) => <span className={`text-xs font-semibold px-2 py-1 rounded-full ${Number(row.stock_quantity) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>{row.stock_quantity || 0} pz</span> },
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
      <div className="flex gap-4 text-slate-400">
        <Tooltip title="Edit">
          <button onClick={() => onEdit(row)} className="hover:text-slate-800 transition-colors">
            <Edit3 size={16} />
          </button>
        </Tooltip>
        <Tooltip title="Delete">
          <button onClick={() => onDelete(row)} className="hover:text-red-600 transition-colors">
            <Trash2 size={16} />
          </button>
        </Tooltip>
      </div>
    ),
  },

];