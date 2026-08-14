import { Edit3, Trash2, RotateCcw } from 'lucide-react';
import { Tooltip } from '@mui/material';

export const getColorColumns = ({ onEdit, onDelete, onRestore, isTrash }) => [
  {
    id: 'sno',
    label: 'S.No',
    render: (row, sno) => <span className="text-sm font-semibold text-slate-500">{sno}</span>,
  },
  {
    id: 'col_preview',
    label: 'Preview',
    render: (row) => (
      <div className="flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded-full border border-slate-200" 
          style={{ backgroundColor: row.col_hex_code }}
        />
        <span className="text-xs font-mono text-slate-400">{row.col_hex_code}</span>
      </div>
    ),
  },
  {
    id: 'col_name',
    label: 'Color Name',
    render: (row) => <span className="text-sm font-bold text-slate-800">{row.col_name}</span>,
  },
  {
    id: 'created_at',
    label: 'Created At',
    render: (row) => <span className="text-sm font-medium text-slate-500">{row.created_at}</span>,
  },
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