import { Search } from 'lucide-react';

export interface SelectFilter {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: SelectFilter[];
}

export default function FilterBar({ searchValue, onSearchChange, searchPlaceholder = 'Search...', filters = [] }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:w-72">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-sm text-navy-900 outline-none placeholder:text-slate-400"
        />
      </div>
      {filters.map((filter) => (
        <select
          key={filter.label}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-teal-500"
        >
          <option value="">{filter.label}: All</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
