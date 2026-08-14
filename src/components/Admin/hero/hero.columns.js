import { Edit3, Trash2, RotateCcw } from 'lucide-react';
import { Tooltip } from '@mui/material';
import StatusToggle from '@/sharables/StatusToggle';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const getHeroSlidesColumns = ({ onEdit, onDelete, onToggle, onRestore, isTrash = false }) => [
  {
    id: 'order_no',
    label: 'Order',
    render: (row) => <span className="text-sm font-semibold text-slate-600">{row.order_no ?? 0}</span>,
  },
  {
    id: 'image',
    label: 'Slide Image',
    render: (row) => (
      <div className="w-20 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
        {row.image ? (
          <img src={`${API_URL}${row.image}`} alt={row.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-400 font-bold text-xs uppercase">N/A</span>
        )}
      </div>
    ),
  },
  {
    id: 'title',
    label: 'Title',
    render: (row) => <span className="text-sm font-bold text-slate-800 line-clamp-1 max-w-[12.5rem]">{row.title}</span>,
  },
  {
    id: 'button_text',
    label: 'Button',
    render: (row) => <span className="text-sm text-slate-600">{row.button_text || 'N/A'}</span>,
  },
  {
    id: 'is_active',
    label: 'Status',
    render: (row) => isTrash ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">Deleted</span>
    ) : (
      <StatusToggle isActive={row.is_active} onToggle={() => onToggle && onToggle(row)} />
    ),
  },
  {
    id: 'actions',
    label: 'Actions',
    render: (row) => isTrash ? (
      <Tooltip title="Restore">
        <button
          onClick={() => onRestore && onRestore(row)}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg border border-emerald-200 transition-all active:scale-95"
        >
          <RotateCcw size={14} /> Restore
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

export const getHeroMarqueeColumns = ({ onEdit, onDelete, onToggle, onRestore, isTrash = false }) => [
  {
    id: 'order_no',
    label: 'Order',
    render: (row) => <span className="text-sm font-semibold text-slate-600">{row.order_no ?? 0}</span>,
  },
  {
    id: 'item_text',
    label: 'Text',
    render: (row) => <span className="text-sm font-bold text-slate-800">{row.item_text}</span>,
  },
  {
    id: 'is_active',
    label: 'Status',
    render: (row) => isTrash ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">Deleted</span>
    ) : (
      <StatusToggle isActive={row.is_active} onToggle={() => onToggle && onToggle(row)} />
    ),
  },
  {
    id: 'actions',
    label: 'Actions',
    render: (row) => isTrash ? (
      <Tooltip title="Restore">
        <button
          onClick={() => onRestore && onRestore(row)}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg border border-emerald-200 transition-all active:scale-95"
        >
          <RotateCcw size={14} /> Restore
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
