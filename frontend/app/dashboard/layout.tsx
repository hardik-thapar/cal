'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Clock, FileText } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">Scheduling</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            href="/dashboard/events"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              isActive('/dashboard/events')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <FileText size={20} />
            <span className="text-sm font-medium">Event types</span>
          </Link>

          <Link
            href="/dashboard/bookings"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              isActive('/dashboard/bookings')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Calendar size={20} />
            <span className="text-sm font-medium">Bookings</span>
          </Link>

          <Link
            href="/dashboard/availability"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
              isActive('/dashboard/availability')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Clock size={20} />
            <span className="text-sm font-medium">Availability</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
