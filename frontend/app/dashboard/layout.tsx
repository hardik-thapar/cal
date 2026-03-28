'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Grid3x3, 
  Users, 
  Smartphone, 
  Route, 
  Workflow, 
  BarChart3,
  Search,
  ChevronDown,
  ExternalLink,
  Copy,
  Gift,
  Settings,
  HelpCircle,
  Menu,
  Command
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { href: '/dashboard/events', label: 'Event types', icon: Grid3x3 },
    { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
    { href: '/dashboard/availability', label: 'Availability', icon: Clock },
    { href: '/dashboard/teams', label: 'Teams', icon: Users },
    { href: '/dashboard/apps', label: 'Apps', icon: Smartphone },
    { href: '/dashboard/routing', label: 'Routing', icon: Route },
    { href: '/dashboard/workflows', label: 'Workflows', icon: Workflow },
    { href: '/dashboard/insights', label: 'Insights', icon: BarChart3 },
  ];

  const bottomNavItems = [
    { href: '/public', label: 'View public page', icon: ExternalLink },
    { href: '#', label: 'Copy public page link', icon: Copy },
    { href: '#', label: 'Refer and earn', icon: Gift },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-black text-[#f4f4f5]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-[#272727] transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header / User Switcher */}
          <div className="p-4">
            <div className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-[#1a1a1b] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#3b82f6] rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  H
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold tracking-tight uppercase truncate max-w-[120px]">HARDIK THAPAR</span>
                  <ChevronDown size={14} className="text-[#a1a1aa]" />
                </div>
              </div>
              <div className="p-1.5 hover:bg-[#272727] rounded transition-colors">
                <Search size={14} className="text-[#a1a1aa]" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1a1a1b] text-white font-medium shadow-sm'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1b]'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-3 py-4 space-y-0.5 border-t border-[#272727]">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1b] transition-all duration-200"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#272727]">
            <div className="flex items-center justify-between mb-3">
              <button className="flex items-center gap-1.5 text-xs font-medium text-[#a1a1aa] hover:text-white transition-colors">
                <HelpCircle size={14} />
                Need help?
              </button>
              <div className="flex items-center gap-1">
                {[Calendar, Grid3x3, BarChart3].map((Icon, i) => (
                  <button key={i} className="p-1.5 hover:bg-[#1a1a1b] rounded transition-colors text-[#a1a1aa] hover:text-white">
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#71717a] font-medium tracking-wider uppercase">
              <span>© 2026 CAL.COM</span>
              <span className="flex items-center gap-1">
                <Command size={10} />
                V.6.3.7
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-[#111111] border-b border-[#272727]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#3b82f6] rounded-full" />
            <span className="font-bold text-sm tracking-tight uppercase">HARDIK THAPAR</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-[#a1a1aa] hover:text-white">
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-black p-4 lg:p-8">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
