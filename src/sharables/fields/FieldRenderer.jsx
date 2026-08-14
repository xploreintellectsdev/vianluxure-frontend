import React from 'react';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Upload, X, Plus, Trash2 } from 'lucide-react';

const inputClass = (hasError, isDisabled = false) => `
  w-full px-4 py-2.5 rounded-xl bg-white border text-sm font-semibold text-stone-800 
  outline-none transition-all placeholder:font-normal placeholder:text-stone-300
  ${hasError ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-stone-200 focus:border-[#A67C3D] focus:ring-2 focus:ring-[#A67C3D]/10'}
  ${isDisabled ? 'bg-stone-50 cursor-not-allowed opacity-75' : ''}
`;

const reactSelectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    borderRadius: '0.75rem',
    borderColor: hasError ? '#f87171' : state.isFocused ? '#A67C3D' : '#e7e2da',
    boxShadow: state.isFocused && !hasError ? '0 0 0 3px rgba(166,124,61,0.1)' : 'none',
    fontSize: '0.875rem',
    fontWeight: 600,
    minHeight: '42px',
    '&:hover': { borderColor: '#A67C3D' },
  }),
  placeholder: (base) => ({ ...base, color: '#d6d3d1', fontWeight: 400 }),
  menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #EDE9E3', boxShadow: '0 12px 32px rgba(28,25,23,0.08)' }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: state.isSelected ? '#A67C3D' : state.isFocused ? 'rgba(166,124,61,0.08)' : 'white',
    color: state.isSelected ? 'white' : '#292524',
  }),
});

const FieldLabel = ({ label, required }) => (
  <label className="text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider">
    {label} {required && <span className="text-[#A67C3D]">*</span>}
  </label>
);

const FieldError = ({ message }) =>
  message ? <p className="text-xs font-semibold text-red-500 mt-1">{message}</p> : null;

// ── FIX: Extract AsyncCheckboxGroup into its own component to satisfy React Hook rules ──
const AsyncCheckboxGroup = ({ fieldConfig, value, onChange }) => {
  const [options, setOptions] = React.useState([]);

  React.useEffect(() => {
    fieldConfig.fetchPage({ limit: 100 }).then(res => {
      const raw = res?.data?.data || res?.data || [];
      setOptions(raw.map(fieldConfig.mapOption));
    });
  }, [fieldConfig]);

  const selectedIds = Array.isArray(value) ? value : [];

  const handleChange = (e, optionValue) => {
    if (e.target.checked) {
      onChange([...selectedIds, optionValue]);
    } else {
      onChange(selectedIds.filter(id => id !== optionValue));
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mt-2 mb-1">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={selectedIds.includes(opt.value)}
            onChange={(e) => handleChange(e, opt.value)}
            className="w-4 h-4 rounded border-stone-300 text-[#A67C3D] focus:ring-[#A67C3D] transition-colors cursor-pointer"
          />
          <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors">
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
};

const FieldRenderer = ({ fieldConfig, control, errors, editData }) => {
  const error = errors[fieldConfig.name];
  const wrapperClass = `flex flex-col gap-1.5 w-full ${fieldConfig.colSpan === 2 ? 'sm:col-span-2' : ''}`;

  return (
    <div className={wrapperClass}>
      <FieldLabel label={fieldConfig.label} required={!!fieldConfig.validation?.required} />

      <Controller
        name={fieldConfig.name}
        control={control}
        rules={fieldConfig.validation}
        defaultValue={fieldConfig.defaultValue ?? (['multi-file', 'gallery', 'specs', 'bullet-points'].includes(fieldConfig.type) ? [] : fieldConfig.type === 'checkbox' ? false : '')}
        render={({ field }) => {
          switch (fieldConfig.type) {
            case 'text':
              return (
                <textarea 
                  {...field} 
                  value={field.value ?? ''} 
                  rows={1} 
                  placeholder={fieldConfig.placeholder} 
                  disabled={fieldConfig.disabled}
                  className={`${inputClass(!!error, fieldConfig.disabled)} resize-none overflow-hidden`}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  ref={(e) => {
                    if (typeof field.ref === 'function') field.ref(e);
                    if (e) {
                      e.style.height = 'auto';
                      e.style.height = e.scrollHeight + 'px';
                    }
                  }}
                />
              );

            case 'number':
            case 'email':
            case 'date':
              return <input {...field} value={field.value ?? ''} type={fieldConfig.type} placeholder={fieldConfig.placeholder} disabled={fieldConfig.disabled} step={fieldConfig.step || (fieldConfig.type === 'number' ? "any" : undefined)} className={inputClass(!!error, fieldConfig.disabled)} />;

            case 'textarea':
              return (
                <textarea 
                  {...field} 
                  value={field.value ?? ''} 
                  rows={3} 
                  placeholder={fieldConfig.placeholder} 
                  className={`${inputClass(!!error)} resize-none min-h-[5rem] overflow-hidden`}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  ref={(e) => {
                    if (typeof field.ref === 'function') field.ref(e);
                    if (e) {
                      e.style.height = 'auto';
                      e.style.height = e.scrollHeight + 'px';
                    }
                  }}
                />
              );

            case 'select':
              return (
                <ReactSelect
                  {...field}
                  options={fieldConfig.options}
                  styles={reactSelectStyles(!!error)}
                  placeholder={fieldConfig.placeholder}
                  value={fieldConfig.options?.find((o) => o.value === field.value) || null}
                  onChange={(opt) => field.onChange(opt ? opt.value : '')}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
              );

            case 'paginated-select': {
              const loadOptions = async (search, loadedOptions, { page }) => {
                const res = await fieldConfig.fetchPage({ search, page, limit: 10 });
                const rows = res?.data ?? [];
                const meta = res?.meta ?? {};
                return {
                  options: rows.map(fieldConfig.mapOption),
                  hasMore: meta.hasNextPage,
                  additional: { page: page + 1 },
                };
              };

              const fallbackLabel = fieldConfig.editLabelKey && editData ? editData[fieldConfig.editLabelKey] : null;
              const rawValue = field.value;

              const currentValue = rawValue
                ? (typeof rawValue === 'object'
                    ? rawValue
                    : { value: rawValue, label: fallbackLabel ?? String(rawValue) })
                : null;

              return (
                <AsyncPaginate
                  value={currentValue}
                  loadOptions={loadOptions}
                  additional={{ page: 1 }}
                  onChange={(opt) => field.onChange(opt || null)}
                  styles={reactSelectStyles(!!error)}
                  placeholder={fieldConfig.placeholder || 'Select...'}
                  debounceTimeout={350}
                  isClearable
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
              );
            }

            case 'multi-paginated-select': {
              const loadOptions = async (search, loadedOptions, { page }) => {
                const res = await fieldConfig.fetchPage({ search, page, limit: 10 });
                const rows = res?.data ?? [];
                const meta = res?.meta ?? {};
                return {
                  options: rows.map(fieldConfig.mapOption),
                  hasMore: meta.hasNextPage,
                  additional: { page: page + 1 },
                };
              };

              const normalizeSelected = (val) => {
                if (!Array.isArray(val)) return [];
                return val.map((v) =>
                  v && typeof v === 'object' && 'value' in v
                    ? v
                    : { value: v?.[fieldConfig.editValueKey] ?? v, label: v?.[fieldConfig.editLabelKey] ?? String(v) }
                );
              };
              const currentValue = normalizeSelected(field.value);

              return (
                <AsyncPaginate
                  isMulti
                  value={currentValue}
                  loadOptions={loadOptions}
                  additional={{ page: 1 }}
                  onChange={(opts) => field.onChange(opts || [])}
                  styles={reactSelectStyles(!!error)}
                  placeholder={fieldConfig.placeholder || 'Select...'}
                  debounceTimeout={350}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
              );
            }

            // ── Call the new isolated component here! ──
            case 'async-checkbox-group':
              return (
                <AsyncCheckboxGroup 
                  fieldConfig={fieldConfig} 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              );

            case 'bullet-points': {
              const bullets = Array.isArray(field.value) ? field.value : [];
              const addRow = () => field.onChange([...bullets, '']);
              const updateRow = (idx, val) => {
                const updated = [...bullets];
                updated[idx] = val;
                field.onChange(updated);
              };
              const removeRow = (idx) => field.onChange(bullets.filter((_, i) => i !== idx));

              return (
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 space-y-3">
                  {bullets.map((bullet, idx) => {
                    const bulletStr = typeof bullet === 'object' && bullet !== null ? (bullet.title || '') : (bullet || '');
                    return (
                    <div key={idx} className="flex gap-2 items-center">
                      <input placeholder="Enter bullet point..." className="flex-1 px-3 py-2 text-sm font-medium bg-white border border-stone-200 rounded-lg outline-none focus:border-[#A67C3D]" value={bulletStr} onChange={(e) => updateRow(idx, e.target.value)} />
                      <button type="button" onClick={() => removeRow(idx)} className="p-1.5 text-stone-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  )})}
                  <button type="button" onClick={addRow} className="w-full py-2 border border-dashed border-stone-300 rounded-xl text-[0.625rem] font-black uppercase text-stone-500 hover:bg-white hover:border-[#A67C3D] hover:text-[#A67C3D] transition-all flex justify-center items-center gap-2">
                    <Plus size={14} strokeWidth={3} /> Add Bullet Point
                  </button>
                </div>
              );
            }

            case 'specs': {
              const specs = Array.isArray(field.value) ? field.value : [];
              const addRow = () => field.onChange([...specs, { title: '', value: '' }]);
              const updateRow = (idx, key, val) => {
                const updated = [...specs];
                updated[idx][key] = val;
                field.onChange(updated);
              };
              const removeRow = (idx) => field.onChange(specs.filter((_, i) => i !== idx));

              return (
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 space-y-3">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input placeholder="Title" className="w-1/3 px-3 py-2 text-xs font-bold bg-white border border-stone-200 rounded-lg outline-none focus:border-[#A67C3D]" value={spec.title} onChange={(e) => updateRow(idx, 'title', e.target.value)} />
                      <input placeholder="Value" className="flex-1 px-3 py-2 text-xs font-medium bg-white border border-stone-200 rounded-lg outline-none focus:border-[#A67C3D]" value={spec.value} onChange={(e) => updateRow(idx, 'value', e.target.value)} />
                      <button type="button" onClick={() => removeRow(idx)} className="p-1.5 text-stone-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button type="button" onClick={addRow} className="w-full py-2 border border-dashed border-stone-300 rounded-xl text-[0.625rem] font-black uppercase text-stone-500 hover:bg-white hover:border-[#A67C3D] hover:text-[#A67C3D] transition-all flex justify-center items-center gap-2">
                    <Plus size={14} strokeWidth={3} /> Add Specification
                  </button>
                </div>
              );
            }

            case 'image': {
              const preview = field.value instanceof File ? URL.createObjectURL(field.value) : (typeof field.value === 'string' && field.value ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}${field.value}` : null);
              return (
                <div className="flex flex-col gap-2">
                  <label className={`relative flex flex-col items-center justify-center w-full h-28 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all ${error ? 'border-red-300 bg-red-50/20' : 'border-stone-200 hover:border-[#A67C3D]/40'}`}>
                    {preview ? <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" /> : <><Upload size={20} className="text-stone-400" /><span className="text-xs font-medium text-stone-400 mt-2">Upload image</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => field.onChange(e.target.files[0] || null)} />
                  </label>
                </div>
              );
            }

            case 'media': {
              const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
              const preview = field.value instanceof File ? URL.createObjectURL(field.value) : (typeof field.value === 'string' && field.value ? `${API_URL}${field.value}` : null);
              const isVideo = (field.value instanceof File && field.value.type.startsWith('video/')) || (typeof field.value === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(field.value));
              return (
                <div className="flex flex-col gap-2">
                  <label className={`relative flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all ${error ? 'border-red-300 bg-red-50/20' : 'border-stone-200 hover:border-[#A67C3D]/40'}`}>
                    {preview ? (
                      isVideo ? (
                        <video src={preview} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                      )
                    ) : (
                      <><Upload size={22} className="text-stone-400" /><span className="text-xs font-bold text-stone-500 uppercase mt-2">Upload Image / Video</span></>
                    )}
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => field.onChange(e.target.files[0] || null)} />
                  </label>
                </div>
              );
            }

            case 'multi-file': {
                const files = Array.isArray(field.value) ? field.value : [];
                const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
                return (
                  <div className="flex flex-col gap-2">
                    <label className="flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed border-stone-200 cursor-pointer hover:bg-stone-50 transition-all">
                      <Upload size={18} className="text-stone-400" />
                      <span className="text-xs font-medium text-stone-400 mt-1">Add gallery images</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => field.onChange([...files, ...Array.from(e.target.files)])} />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {files.map((file, idx) => {
                        const url = file instanceof File ? URL.createObjectURL(file) : `${API_URL}${file.img_url}`;
                        return (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200">
                            <img src={url} className="w-full h-full object-cover" alt="gallery" />
                            <button type="button" onClick={() => field.onChange(files.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"><X size={10} className="text-white" /></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

            case 'checkbox':
            case 'toggle':
              return (
                <label className="flex items-center gap-2.5 min-h-[2.625rem] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#A67C3D]"
                  />
                  <span className="text-sm font-semibold text-stone-700">{fieldConfig.checkboxLabel || fieldConfig.label}</span>
                </label>
              );

            case 'custom':
              if (typeof fieldConfig.render === 'function') {
                return fieldConfig.render({
                  value: field.value,
                  onChange: field.onChange,
                  error: error
                });
              }
              return null;

            default:
              return <input {...field} type="text" className={inputClass(!!error)} />;
          }
        }}
      />
      <FieldError message={error?.message} />
    </div>
  );
};

export default FieldRenderer;