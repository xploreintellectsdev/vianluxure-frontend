import { CheckCircle, Trash2 } from 'lucide-react';

/**
 * ActiveTrashBar - the Active / Trash pill selector used at the top of tables.
 * Usage: <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
 */
export default function ActiveTrashBar({ viewMode, onChange }) {
  return (
    <div className="flex items-center bg-stone-200/60 p-1 rounded-xl border border-stone-300/60 shrink-0">
      <button
        onClick={() => onChange('active')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
          viewMode === 'active'
            ? 'bg-gradient-to-r from-[#C8A64D] to-[#B39340] text-white shadow-sm'
            : 'text-slate-600 hover:text-[#C8A64D]'
        }`}
      >
        <CheckCircle size={14} />
        <span>Active</span>
      </button>
      <button
        onClick={() => onChange('trash')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
          viewMode === 'trash'
            ? 'bg-amber-700 text-white shadow-sm'
            : 'text-slate-600 hover:text-amber-700'
        }`}
      >
        <Trash2 size={14} />
        <span>Trash</span>
      </button>
    </div>
  );
}
