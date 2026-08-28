import { createClient } from '../../lib/supabase-server';
import { APP_NAME } from '../layout';

async function getStats(supabase: any) {
  const [
    { count: totalBusinesses },
    { count: pendingBusinesses },
    { count: totalBookings },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ]);

  const { data: revenueData } = await supabase
    .from('payments')
    .select('platform_fee')
    .eq('status', 'succeeded');

  const totalRevenue = (revenueData ?? []).reduce((sum: number, p: any) => sum + (p.platform_fee ?? 0), 0);

  return { totalBusinesses, pendingBusinesses, totalBookings, totalUsers, totalRevenue };
}

export default async function AdminDashboard() {
  const supabase = createClient();
  const stats = await getStats(supabase);

  const KPIs = [
    { label: 'Total Businesses', value: stats.totalBusinesses ?? 0, emoji: '🏢', color: 'border-[#C9A84C]' },
    { label: 'Pending Approval', value: stats.pendingBusinesses ?? 0, emoji: '⏳', color: 'border-orange-500' },
    { label: 'Total Bookings', value: stats.totalBookings ?? 0, emoji: '📅', color: 'border-blue-500' },
    { label: 'Users', value: stats.totalUsers ?? 0, emoji: '👥', color: 'border-green-500' },
    { label: 'App Revenue', value: `£${(stats.totalRevenue ?? 0).toFixed(2)}`, emoji: '💰', color: 'border-[#C9A84C]' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">{APP_NAME} Admin</h1>
      <p className="text-gray-400 mb-8">Platform overview and management</p>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {KPIs.map((kpi) => (
          <div key={kpi.label} className={`bg-[#1A1A1A] rounded-xl p-5 border-l-4 ${kpi.color} border border-[#2F2F2F]`}>
            <p className="text-2xl mb-1">{kpi.emoji}</p>
            <p className="text-2xl font-black text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2F2F2F]">
          <h2 className="text-lg font-bold text-white mb-4">⚡ Quick Actions</h2>
          <div className="space-y-3">
            <ActionLink href="/admin/businesses?filter=pending" label="Review pending businesses" count={stats.pendingBusinesses ?? 0} />
            <ActionLink href="/admin/bookings" label="View all bookings" count={stats.totalBookings ?? 0} />
            <ActionLink href="/admin/payments" label="Review payments" />
            <ActionLink href="/admin/analytics" label="View analytics" />
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2F2F2F]">
          <h2 className="text-lg font-bold text-white mb-4">📋 Platform Info</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Free plan: up to 20 bookings/month</p>
            <p>• Pro plan: £19.99/month — unlimited</p>
            <p>• Premium plan: £49.99/month — full features</p>
            <p>• Platform fee: 10% of each deposit</p>
            <p>• Featured listing boost: paid per business</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionLink({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <a href={href} className="flex items-center justify-between p-3 bg-[#252525] hover:bg-[#2F2F2F] rounded-lg transition-colors group">
      <span className="text-sm text-gray-300 group-hover:text-white">{label}</span>
      {count !== undefined && (
        <span className="text-xs bg-[#C9A84C] text-black px-2 py-0.5 rounded-full font-bold">{count}</span>
      )}
    </a>
  );
}
