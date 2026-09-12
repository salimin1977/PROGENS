import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, School, UserCog, BookOpen, X } from 'lucide-react';
import { globalSearch, type SearchResult, type SearchResultType } from '../../services/searchService';

const ICON_BY_TYPE: Record<SearchResultType, typeof Users> = {
  student: Users,
  class: School,
  teacher: UserCog,
  subject: BookOpen,
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Below the 2-character minimum, just don't fetch — the dropdown is
    // already gated on the same length check at render time, so stale
    // `results` from a previous query never becomes visible.
    if (query.trim().length < 2) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      globalSearch(query).then((r) => {
        if (!cancelled) setResults(r);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    navigate(result.href);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus-within:border-teal-500">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search students, classes, teachers, subjects..."
          className="w-64 bg-transparent text-navy-900 outline-none placeholder:text-slate-400"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="text-slate-400 hover:text-navy-700">
            <X size={14} />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute right-0 z-40 mt-1 max-h-80 w-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-elevated">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">No results for &ldquo;{query}&rdquo;.</p>
          ) : (
            results.map((r) => {
              const Icon = ICON_BY_TYPE[r.type];
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50"
                >
                  <Icon size={16} className="shrink-0 text-teal-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-navy-900">{r.label}</span>
                    <span className="block truncate text-xs text-slate-400">{r.meta}</span>
                  </span>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-300">{r.type}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
