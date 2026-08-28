import Link from 'next/link';
import { APP_NAME } from '../layout';

const NAV = [
  { href: '/admin', label: '📊 Dashboard', exact: true },
  { href: '/admin/businesses', label: '🏢 Businesses' },
  { href: '/admin/bookings', label: '📅 Bookings' },
  { href: '/admin/payments', label: '💰 Payments' },
  { href: '/admin/users', label: '👥 Users' },
  { href: '/admin/categories', label: '🏷️ Categories' },
  { href: '/admin/analytics', label: '📈 Analytics' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1A1A] border-r border-[#2F2F2F] flex flex-col fixed top-0 left-0 h-full z-40">
        <div className="p-6 border-b border-[#2F2F2F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C9A84C] rounded-lg flex items-center justify-center font-black text-black text-sm">
              BL
            </div>
            <div>
              <p className="font-bold text-white text-sm">{APP_NAME}</p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#2F2F2F] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2F2F2F]">
          <p className="text-xs text-gray-600">© 2026 {APP_NAME}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
