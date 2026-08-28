import { createClient } from '../../../lib/supabase-server';
import { format, parseISO } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900 text-yellow-300',
  confirmed: 'bg-green-900 text-green-300',
  completed: 'bg-gray-700 text-gray-300',
  cancelled: 'bg-red-900 text-red-300',
  no_show: 'bg-orange-900 text-orange-300',
};

export default async function BookingsPage() {
  const supabase = createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      business:businesses(name),
      service:services(name),
      customer:users(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Bookings</h1>
      <p className="text-gray-400 text-sm mb-6">{bookings?.length ?? 0} most recent</p>

      <div className="bg-[#1A1A1A] rounded-xl border border-[#2F2F2F] overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-[#2F2F2F]">
              {['Customer', 'Business', 'Service', 'Date & Time', 'Total', 'Deposit', 'Status'].map((h) => (
                <th key={h} className="text-left p-4 text-gray-400 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(bookings ?? []).map((b: any) => (
              <tr key={b.id} className="border-b border-[#252525] hover:bg-[#252525] transition-colors">
                <td className="p-4">
                  <p className="text-white font-medium">{b.customer?.full_name}</p>
                  <p className="text-gray-500 text-xs">{b.customer?.email}</p>
                </td>
                <td className="p-4 text-gray-300">{b.business?.name}</td>
                <td className="p-4 text-gray-300">{b.service?.name}</td>
                <td className="p-4 text-gray-300">
                  {b.start_time ? format(parseISO(b.start_time), 'd MMM yyyy, HH:mm') : '—'}
                </td>
                <td className="p-4 text-white font-bold">£{b.total_price?.toFixed(2)}</td>
                <td className="p-4">
                  {b.deposit_paid ? (
                    <span className="text-green-400 font-bold">£{b.deposit_amount?.toFixed(2)} ✓</span>
                  ) : (
                    <span className="text-gray-500">£{b.deposit_amount?.toFixed(2)}</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${STATUS_COLORS[b.status] ?? 'bg-gray-700 text-gray-300'}`}>
                    {b.status?.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(bookings ?? []).length === 0 && (
          <p className="text-center text-gray-500 py-12">No bookings found.</p>
        )}
      </div>
    </div>
  );
}
