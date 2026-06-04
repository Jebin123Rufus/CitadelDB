import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Search,
  Brain,
  BookOpen,
  Newspaper,
  Target,
  TrendingUp,
  Fingerprint,
  Wrench,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cve', icon: Search, label: 'CVE Center' },
  { to: '/analyst', icon: Brain, label: 'AI Analyst' },
  { to: '/explainer', icon: BookOpen, label: 'Threat Explainer' },
  { to: '/news', icon: Newspaper, label: 'Security News' },
  { to: '/attack', icon: Target, label: 'MITRE ATT&CK' },
  { to: '/trends', icon: TrendingUp, label: 'Threat Trends' },
  { to: '/ioc', icon: Fingerprint, label: 'IOC Analysis' },
  { to: '/toolkit', icon: Wrench, label: 'Security Toolkit' },
  { to: '/assistant', icon: MessageSquare, label: 'AI Assistant' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-citadel-900 border-r border-citadel-700/50 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-citadel-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-citadel-accent/10 border border-citadel-accent/30 animate-pulseGlow">
              <Shield className="w-6 h-6 text-citadel-accent" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">CitadelDB</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Threat Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => (isActive ? 'nav-link-active' : 'nav-link')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-citadel-700/50">
          <p className="text-[10px] text-gray-600 text-center">
            Live NVD • GROQ AI • Stateless
          </p>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-citadel-950/90 backdrop-blur border-b border-citadel-700/50 px-4 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-citadel-accent">CitadelDB</span>
          <button onClick={() => setMobileOpen(false)} className="p-2 lg:hidden">
            <X className={`w-5 h-5 ${mobileOpen ? 'text-gray-400' : 'text-transparent'}`} />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
