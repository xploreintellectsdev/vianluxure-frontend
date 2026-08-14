import React from 'react';
import { Pencil, Trash2, Layers, Image as ImageIcon, RotateCcw } from 'lucide-react';
import StatusToggle from '@/sharables/StatusToggle';

export const getAboutSectionsColumns = ({ onEdit, onDelete, onManageItems, onManageGallery, onToggle, onRestore, isTrash = false }) => [
  {
    id: 'order',
    label: 'Order',
    render: row => row.order_no
  },
  {
    id: 'section_key',
    label: 'Key',
    render: row => row.section_key
  },
  {
    id: 'section_type',
    label: 'Type',
    render: row => row.section_type
  },
  {
    id: 'title',
    label: 'Title',
    render: row => row.title
  },
  {
    id: 'active',
    label: 'Active',
    render: row => isTrash ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">Deleted</span>
    ) : (
      <StatusToggle isActive={row.is_active} onToggle={() => onToggle && onToggle(row)} />
    )
  },
  {
    id: 'actions',
    label: 'Actions',
    render: row => isTrash ? (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onRestore && onRestore(row)}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg border border-emerald-200 transition-all active:scale-95"
        >
          <RotateCcw size={14} /> Restore
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(row)}
          className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          title="Edit Section"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(row)}
          className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          title="Delete Section"
        >
          <Trash2 size={16} />
        </button>
        {row.section_type === 'gallery' && (
          <button
            onClick={() => onManageGallery && onManageGallery(row)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors font-semibold text-xs"
            title="Manage Gallery Images"
          >
            <ImageIcon size={14} />
            <span>Manage Gallery</span>
          </button>
        )}
      </div>
    )
  }
];
