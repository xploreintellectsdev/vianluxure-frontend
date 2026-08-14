import { Edit3, Trash2 } from 'lucide-react';
import { Tooltip } from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const getCustomStyleColumns = ({ onEdit, onDelete, typeLabel }) => [
  {
    id: 'sno',
    label: 'S.No',
    render: (row, sno) => <span className="text-sm font-semibold text-slate-500">{sno}</span>,
  },
  {
    id: 'option_image',
    label: 'Image',
    render: (row) => (
      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
        {row.option_image ? (
          <img src={`${API_URL}${row.option_image}`} alt={row.option_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-400 font-bold text-xs uppercase">N/A</span>
        )}
      </div>
    ),
  },
  { id: 'option_name', label: `${typeLabel} Name`, render: (row) => <span className="text-sm font-bold text-slate-800">{row.option_name}</span> },
  { id: 'option_price', label: 'Price', render: (row) => <span className="text-sm font-bold text-slate-900">₹{row.option_price}</span> },
  {
    id: 'actions',
    label: 'Actions',
    render: (row) => (
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