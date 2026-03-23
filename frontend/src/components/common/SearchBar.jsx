import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ placeholder = 'Search...', onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(query);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-vet-600 transition-colors" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 shadow-sm"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-3 h-3 text-slate-500" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
