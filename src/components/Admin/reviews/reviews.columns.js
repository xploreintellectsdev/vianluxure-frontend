import { Edit, Eye, EyeOff, Star, Trash2, RotateCcw } from 'lucide-react';
import Image from 'next/image';

const getApiImageUrl = (url) => {
  if (!url) return url;
  if (typeof window !== 'undefined' && url.includes('localhost')) {
    return url.replace('localhost', window.location.hostname);
  }
  return url;
};

export const getReviewColumns = (onEdit, onToggleVisibility, onDelete, onRestore, isTrash) => [
  {
    id: 'fab_name',
    label: 'Product',
    render: (row) => (
      <div className="flex items-center gap-3">
        {row.review_image_url ? (
          <Image
            src={getApiImageUrl(row.review_image_url)}
            alt="Review"
            width={40}
            height={40}
            unoptimized={true}
            className="w-10 h-10 object-cover rounded shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-xs font-medium text-slate-400">
            N/A
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 line-clamp-1">{row.fab_name || `Fabric #${row.fab_id}`}</span>
          {row.review_title && (
            <span className="text-xs text-slate-500 line-clamp-1">"{row.review_title}"</span>
          )}
        </div>
      </div>
    ),
  },
  {
    id: 'customer_name',
    label: 'Customer',
    render: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-slate-800">{row.customer_name || 'Anonymous'}</span>
        {row.customer_email && <span className="text-xs text-slate-500">{row.customer_email}</span>}
      </div>
    ),
  },
  {
    id: 'rating',
    label: 'Rating',
    render: (row) => (
      <div className="flex items-center gap-1 bg-[#F5F0E1] px-2 py-1 rounded w-fit">
        <Star className="fill-[#C8A64D] text-[#C8A64D]" size={14} />
        <span className="text-sm font-bold text-[#C8A64D]">{row.rating}</span>
      </div>
    ),
  },
  {
    id: 'review_text',
    label: 'Comment',
    render: (row) => (
      <p className="text-sm text-slate-600 line-clamp-2 max-w-xs" title={row.review_text}>
        {row.review_text}
      </p>
    ),
  },
  {
    id: 'is_approved',
    label: 'Status',
    render: (row) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          row.is_approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {row.is_approved ? 'APPROVED (VISIBLE)' : 'HIDDEN'}
      </span>
    ),
  },
  {
    id: 'created_at',
    label: 'Date',
    render: (row) => {
      const date = new Date(row.created_at);
      return (
        <span className="text-sm text-slate-600 whitespace-nowrap">
          {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      );
    },
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
    render: (row) => isTrash ? (
      <button
        onClick={() => onRestore(row)}
        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg border border-emerald-200 transition-all shadow-sm active:scale-95"
        title="Restore Review"
      >
        <RotateCcw size={14} />
        <span>Restore</span>
      </button>
    ) : (
      <div className="flex justify-end gap-2">
        <button
          onClick={() => onToggleVisibility(row)}
          className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
          title={row.is_approved ? 'Hide Review' : 'Show Review'}
        >
          {row.is_approved ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <button
          onClick={() => onEdit(row)}
          className="p-1.5 text-slate-400 hover:text-[#C8A64D] transition-colors"
          title="Edit Review"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(row)}
          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
          title="Delete Review"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  },
];
