import { Edit3, Trash2, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { Tooltip } from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const getFabricCategoryColumns = ({ onEdit, onDelete, onRestore, isTrash }) => [
  { id: 'sno', label: 'S.No', render: (row, sno) => <span className="text-sm font-semibold text-slate-500">{sno}</span> },
  {
    id: 'fc_image',
    label: 'Image',
    render: (row) =>
      row.fc_image ? (
        <img src={`${API_URL}${row.fc_image}`} alt={row.fc_name} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
          <ImageIcon size={16} />
        </div>
      ),
  },
  { id: 'fc_name', label: 'Name', render: (row) => <span className="text-sm font-bold text-slate-800">{row.fc_name}</span> },
  { id: 'fc_slug', label: 'Slug', render: (row) => <span className="text-sm font-medium text-slate-600">{row.fc_slug}</span> },
  { id: 'created_at', label: 'Created At', render: (row) => <span className="text-sm font-medium text-slate-500">{row.created_at}</span> },
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
        <Tooltip title="Edit"><button onClick={() => onEdit(row)} className="hover:text-slate-800 transition-colors"><Edit3 size={16} /></button></Tooltip>
        <Tooltip title="Delete"><button onClick={() => onDelete(row)} className="hover:text-red-600 transition-colors"><Trash2 size={16} /></button></Tooltip>
      </div>
    ),
  },
];