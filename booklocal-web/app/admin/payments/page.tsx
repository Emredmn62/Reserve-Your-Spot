import { createClient } from '../../../lib/supabase-server';
import { format, parseISO } from 'date-fns';

export default async function PaymentsPage() {
  const supabase = createClient();
  const { data: payments } = await supabase
    .from('payments')
    .select('*, business:businesses(name), customer:users(full_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  const totalRevenue = (payments ?? [])
    .filter((p: any) => p.status === 'succeeded')
    .reduce((sum: number, p: any) => sum + (p.platform_fee ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Payments</h1>
          <p className="text-gray-400 text-sm mt-1">Platform revenue: <span className="text-[#C9A84C] font-bold">£{totalRevenue.toFixed(2)}</span></p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-xl border border-[#2F2F2F] overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-[#2F2F2F]">
              {['Customer', 'Business', 'Amount', 'Platform Fee', 'Business Gets', 'Type', 'Status', 'Date'].map((h) => (
                <th key={h} className="text-left p-4 text-gray-400 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p: any) => (
              <tr key={p.id} className="border-b border-[#252525] hover:bg-[#252525] transition-colors">
                <td className="p-4 text-gray-300">{p.customer?.full_name}</td>
                <td className="p-4 text-gray-300">{p.business?.name}</td>
                <td className="p-4 text-white font-bold">£{p.amount?.toFixed(2)}</td>
                <td className="p-4 text-[#C9A84C] font-bold">£{p.platform_fee?.toFixed(2)}</td>
                <td className="p-4 text-green-400">£{p.business_amount?.toFixed(2)}</td>
                <td className="p-4 text-gray-400 capitalize">{p.type}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    p.status === 'succeeded' ? 'bg-green-900 text-green-300' :
                    p.status === 'refunded' ? 'bg-orange-900 text-orange-300' :
                    p.status === 'failed' ? 'bg-red-900 text-red-300' :
                    'bg-yellow-900 text-yellow-300'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-xs">
                  {p.created_at ? format(parseISO(p.created_at), 'd MMM yyyy') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
