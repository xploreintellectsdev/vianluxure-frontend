import { Edit, Trash2, RotateCcw } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';
import StatusToggle from '@/sharables/StatusToggle';

export const getBannersColumns = ({ onEdit, onDelete, onToggle, onRestore, isTrash = false }) => [
  {
    id: 'order',
    label: 'Order',
    render: row => <span className="text-sm font-semibold">{row.order_no}</span>,
    sortable: true,
    width: '80px'
  },
  {
    id: 'image',
    label: 'Image',
    render: row => (
      <img
        src={getImageUrl(row.image)}
        alt={row.title}
        className="w-16 h-10 object-cover rounded-md border border-gray-200"
      />
    ),
    width: '100px'
  },
  {
    id: 'banner_key',
    label: 'Banner Key',
    render: row => row.banner_key,
    sortable: true
  },
  {
    id: 'title',
    label: 'Title',
    render: row => row.title,
    sortable: true
  },
  {
    id: 'layout_type',
    label: 'Layout',
    render: row => (
      <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded">
        {row.layout_type}
      </span>
    )
  },
  {
    id: 'active',
    label: 'Status',
    render: row => isTrash ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">Deleted</span>
    ) : (
      <StatusToggle isActive={row.is_active} onToggle={() => onToggle && onToggle(row)} />
    ),
    width: '100px'
  },
  {
    id: 'actions',
    label: 'Actions',
    render: row => isTrash ? (
      <button
        onClick={() => onRestore && onRestore(row)}
        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg border border-emerald-200 transition-all active:scale-95"
      >
        <RotateCcw size={14} /> Restore
      </button>
    ) : (
      <div className="flex gap-2">
        <button onClick={() => onEdit(row)} className="p-1 hover:bg-gray-100 rounded text-blue-500" title="Edit">
          <Edit size={16} />
        </button>
        <button onClick={() => onDelete(row)} className="p-1 hover:bg-gray-100 rounded text-red-500" title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    ),
    width: '120px',
    ignoreRowClick: true
  }
];
