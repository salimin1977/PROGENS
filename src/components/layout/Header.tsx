import { Menu, Bell } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-navy-800 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-navy-950 sm:text-xl">{title}</h1>
          {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <GlobalSearch />
        <button type="button" className="relative rounded-md p-2 text-navy-700 hover:bg-slate-100" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-500" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-teal-300">
          PN
        </div>
      </div>
    </header>
  );
}
