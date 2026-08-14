import React from 'react';
import { Pencil, Trash2, RotateCcw } from 'lucide-react';
import StatusToggle from '@/sharables/StatusToggle';

export const getPolicySectionsColumns = ({ onEdit, onDelete, onToggle, onRestore, isTrash = false }) => [
  {
    id: 'order',
    label: 'Order',
    render: row => row.order_no
  },
  {
    id: 'type',
    label: 'Type',
    render: row => row.section_type === 'stat' ? 'Stat Block' : 'Policy Card'
  },
  {
    id: 'title',
    label: 'Title / Value',
    render: row => row.section_type === 'stat' ? `${row.stat_value} ${row.stat_unit}` : (row.title || 'Untitled')
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
      </div>
    )
  }
];
