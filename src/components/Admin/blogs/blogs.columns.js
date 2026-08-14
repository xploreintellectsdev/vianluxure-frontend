import { Edit3, Trash2, RotateCcw } from 'lucide-react';
import { Tooltip } from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const formatDate = (dateVal) => {
  if (!dateVal) return "N/A";
  let parsed = new Date(dateVal);
  if (isNaN(parsed.getTime()) && typeof dateVal === "string") {
    parsed = new Date(dateVal.replace(" ", "T"));
  }
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return typeof dateVal === "string" ? dateVal.slice(0, 10) : "N/A";
};

export const getBlogsColumns = ({ onEdit, onDelete, onRestore, isTrash }) => [
  {
    id: 'order_no',
    label: 'Order',
    render: (row) => <span className="text-sm font-semibold text-slate-600">{row.order_no ?? 0}</span>,
  },
  {
    id: 'blog_image',
    label: 'Cover Image',
    render: (row) => (
      <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
        {row.blog_image ? (
          <img src={`${API_URL}${row.blog_image}`} alt={row.blog_title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-400 font-bold text-xs uppercase">N/A</span>
        )}
      </div>
    ),
  },
  {
    id: 'blog_title',
    label: 'Title',
    render: (row) => <span className="text-sm font-bold text-slate-800 line-clamp-1 max-w-[15.625rem]">{row.blog_title}</span>,
  },
  {
    id: 'published_date',
    label: 'Date',
    render: (row) => (
      <span className="text-xs font-medium text-slate-500 font-mono">
        {formatDate(row.published_date)}
      </span>
    ),
  },
  {
    id: 'is_active',
    label: 'Status',
    render: (row) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider ${
        row.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
      }`}>
        {row.is_active ? 'Active' : 'Draft'}
      </span>
    ),
  },
  {
    id: 'actions',
    label: 'Actions',
    render: (row) => isTrash ? (
      <Tooltip title="Restore Blog">
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
