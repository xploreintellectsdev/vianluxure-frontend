import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, onSearch, placeholder }) => {
  const inputRef = useRef(null);

  // Debounce logic: Triggers search after user stops typing for 300ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, onSearch]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A64D]/80"
        size={18}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Search inventory, titles or codes..."}
        className="w-full pl-11 pr-10 py-2.5 bg-white/90 rounded-xl outline-none border border-stone-200/80 focus:border-[#C8A64D] focus:ring-2 focus:ring-[#C8A64D]/20 transition-all text-sm font-medium text-slate-800 shadow-2xs focus:bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-100 transition-colors"
          title="Clear Search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;