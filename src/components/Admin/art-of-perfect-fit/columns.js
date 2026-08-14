import { Edit, Trash2, RotateCcw } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';
import { Tooltip } from '@mui/material';

export const getStepColumns = ({ onEdit, onDelete, isTrash, onRestore }) => [
  {
    id: 'image',
    label: 'Image',
    render: row => (
      <img 
        src={getImageUrl(row.image_url)} 
        alt={row.title} 
        className="w-16 h-16 object-cover rounded my-2" 
      />
    ),
    width: '100px'
  },
  { 
    id: 'display_order',
    label: 'Order', 
    render: row => <span className="text-sm font-semibold">{row.display_order}</span>, 
    sortable: true,
    width: '100px'
  },
  { 
    id: 'title',
    label: 'Title', 
    render: row => <span className="font-medium text-slate-800">{row.title}</span>, 
    sortable: true 
  },
  { 
    id: 'description',
    label: 'Description', 
    render: row => (
        <span className="text-sm text-gray-500 line-clamp-2" title={row.description}>
            {row.description}
        </span>
    ), 
    sortable: false 
  },
  {
    id: 'actions',
    label: 'Actions',
    render: row => isTrash ? (
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
      <div className="flex gap-2">
        <button onClick={() => onEdit(row)} className="p-1 hover:bg-gray-100 rounded text-blue-500" title="Edit">
          <Edit size={16} />
        </button>
        <button onClick={() => onDelete(row)} className="p-1 hover:bg-gray-100 rounded text-red-500" title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    ),
    width: '100px',
    ignoreRowClick: true
  }
];
