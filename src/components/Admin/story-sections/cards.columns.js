import { Edit, Trash2 } from 'lucide-react';
import { storySectionApi } from '@/api/storySection.api';
import showToast from '@/sharables/toast';
import { getImageUrl } from '@/utils/imageUtils';

export const getCardsColumns = ({ onEdit, onDelete, sectionId }) => [
  {
    id: 'image',
    label: 'Image',
    render: row => (
      <img 
        src={getImageUrl(row.image)} 
        alt={row.card_title} 
        className="w-16 h-16 object-cover rounded my-2" 
      />
    ),
    width: '100px'
  },
  { 
    id: 'order',
    label: 'Order', 
    render: row => <span className="text-sm font-semibold">{row.order_no}</span>, 
    sortable: true,
    width: '100px'
  },
  { 
    id: 'caption',
    label: 'Caption', 
    render: row => row.caption, 
    sortable: true 
  },
  { 
    id: 'card_title',
    label: 'Card Title', 
    render: row => row.card_title, 
    sortable: true 
  },
  { 
    id: 'active',
    label: 'Active', 
    render: row => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider ${
        (row.is_active === 1 || row.is_active === true) ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
      }`}>
        {(row.is_active === 1 || row.is_active === true) ? 'Active' : 'Draft'}
      </span>
    ),
    width: '100px'
  },
  {
    id: 'actions',
    label: 'Actions',
    render: row => (
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
