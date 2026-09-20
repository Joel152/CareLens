import { NavLink } from 'react-router-dom';
import { FileUp, LayoutDashboard, MessagesSquare, Settings } from 'lucide-react';
import DemoBadge from '../ui/DemoBadge.jsx';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/upload', label: 'Analyze a bill', Icon: FileUp },
  { to: '/chat', label: 'Ask CareLens', Icon: MessagesSquare },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export default function AppLayout({ title, description, actions, children }) {
  return (
    <div className="flex min-h-screen bg-slate-soft">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-line bg-white md:flex">
        <NavLink to="/" className="flex items-center gap-2.5 px-5 py-5">
          <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-white" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">CareLens</span>
        </NavLink>
        <nav className="flex-1 space-y-1 px-3" aria-label="Main">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-accent-soft text-accent' : 'text-slate-muted hover:bg-slate-soft hover:text-ink'
                }`
              }
            >
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4">
          <DemoBadge />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-line bg-white px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-ink">{title}</h1>
            {description ? <p className="text-[13px] text-slate-muted">{description}</p> : null}
          </div>
          {actions}
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
