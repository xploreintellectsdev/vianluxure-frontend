/**
 * StatusToggle - a small pill toggle for Active / Inactive.
 * Usage: <StatusToggle isActive={row.is_active} onToggle={() => handleToggle(row)} />
 */
export default function StatusToggle({ isActive, onToggle, loading = false }) {
  const active = isActive === 1 || isActive === true;
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      title={active ? 'Click to Deactivate' : 'Click to Activate'}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
