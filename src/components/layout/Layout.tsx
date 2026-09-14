import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'PROGENS Command Centre', subtitle: 'From Potential to Progress to Excellence' },
  '/students': { title: 'Students', subtitle: 'Student directory, records and profiles' },
  '/academic': { title: 'Academic Intelligence', subtitle: 'GPS, GPMP, subject and class performance' },
  '/attendance': { title: 'Attendance Intelligence', subtitle: 'Attendance patterns and chronic absence risk' },
  '/intervention': { title: 'Intervention Command', subtitle: 'Active cases, priorities and next actions' },
  '/seeds': { title: 'SEEDS', subtitle: 'Student Early Excellence & Development System — Tingkatan 1-3' },
  '/grow': { title: 'GROW', subtitle: 'Growth & Readiness Optimization — Tingkatan 4' },
  '/reap': { title: 'REAP', subtitle: 'Results Excellence & Achievement Programme — Tingkatan 5' },
  '/stem': { title: 'STEM A Pipeline', subtitle: 'Mathematics and Science pipeline to STEM excellence' },
  '/olympus': { title: 'OLYMPUS', subtitle: 'Strategic School Leadership & Governance' },
  '/nexus': { title: 'NEXUS', subtitle: 'Integrated Data & Intelligence Hub' },
  '/intelligence': { title: 'School Intelligence', subtitle: 'Signal, insight and decision layer' },
  '/data-health': { title: 'Data Health', subtitle: 'Production readiness and data governance checks' },
  '/reports': { title: 'Report Centre', subtitle: 'Generate and review institutional reports' },
  '/settings': { title: 'Settings', subtitle: 'School profile, KPI targets and configuration' },
};

function resolveMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  const base = '/' + pathname.split('/')[1];
  return PAGE_META[base] ?? { title: 'PROGENS', subtitle: '' };
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const meta = resolveMeta(location.pathname);
  return <div className="flex min-h-screen bg-slate-50"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="flex min-w-0 flex-1 flex-col"><Header title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setSidebarOpen(true)} /><main className="flex-1 px-4 py-6 sm:px-6 lg:px-8"><Outlet /></main></div></div>;
}
