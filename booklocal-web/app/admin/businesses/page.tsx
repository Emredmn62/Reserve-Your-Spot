import { createClient } from '../../../lib/supabase-server';

export default async function BusinessesPage({ searchParams }: { searchParams: { filter?: string } }) {
  const supabase = createClient();
  const isPending = searchParams.filter === 'pending';

  let query = supabase
    .from('businesses')
    .select('*, category:categories(name, emoji), owner:users(full_name, email)')
    .order('created_at', { ascending: false });

  if (isPending) query = query.eq('is_approved', false);

  const { data: businesses } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Businesses</h1>
          <p className="text-gray-400 text-sm mt-1">{businesses?.length ?? 0} total</p>
        </div>
        <div className="flex gap-3">
          <a href="/admin/businesses" className={`px-4 py-2 rounded-lg text-sm font-bold ${!isPending ? 'bg-[#C9A84C] text-black' : 'bg-[#252525] text-gray-400'}`}>
            All
          </a>
          <a href="/admin/businesses?filter=pending" className={`px-4 py-2 rounded-lg text-sm font-bold ${isPending ? 'bg-[#C9A84C] text-black' : 'bg-[#252525] text-gray-400'}`}>
            Pending
          </a>
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-xl border border-[#2F2F2F] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2F2F2F]">
              <th className="text-left p-4 text-gray-400 font-semibold">Business</th>
              <th className="text-left p-4 text-gray-400 font-semibold">Category</th>
              <th className="text-left p-4 text-gray-400 font-semibold">Owner</th>
              <th className="text-left p-4 text-gray-400 font-semibold">Plan</th>
              <th className="text-left p-4 text-gray-400 font-semibold">Status</th>
              <th className="text-left p-4 text-gray-400 font-semibold">Rating</th>
              <th className="text-right p-4 text-gray-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(businesses ?? []).map((b: any) => (
              <tr key={b.id} className="border-b border-[#252525] hover:bg-[#252525] transition-colors">
                <td className="p-4">
                  <p className="font-bold text-white">{b.name}</p>
                  <p className="text-gray-500 text-xs">/{b.slug}</p>
                </td>
                <td className="p-4 text-gray-400">
                  {b.category?.emoji} {b.category?.name}
                </td>
                <td className="p-4">
                  <p className="text-gray-300">{b.owner?.full_name}</p>
                  <p className="text-gray-500 text-xs">{b.owner?.email}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    b.subscription_plan === 'premium' ? 'bg-purple-900 text-purple-300' :
                    b.subscription_plan === 'pro' ? 'bg-blue-900 text-blue-300' :
                    'bg-[#2F2F2F] text-gray-400'
                  }`}>
                    {b.subscription_plan.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${b.is_approved ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'}`}>
                    {b.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  {b.is_featured && <span className="ml-1 px-2 py-1 rounded text-xs font-bold bg-yellow-900 text-yellow-300">Featured</span>}
                </td>
                <td className="p-4 text-[#C9A84C] font-bold">
                  {b.rating > 0 ? `⭐ ${b.rating.toFixed(1)}` : '—'}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {!b.is_approved && (
                      <ApproveButton businessId={b.id} />
                    )}
                    <SuspendButton businessId={b.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(businesses ?? []).length === 0 && (
          <p className="text-center text-gray-500 py-12">No businesses found.</p>
        )}
      </div>
    </div>
  );
}

function ApproveButton({ businessId }: { businessId: string }) {
  return (
    <form action={`/api/admin/approve-business`} method="POST">
      <input type="hidden" name="id" value={businessId} />
      <button type="submit" className="px-3 py-1.5 bg-green-800 hover:bg-green-700 text-green-300 rounded text-xs font-bold transition-colors">
        Approve
      </button>
    </form>
  );
}

function SuspendButton({ businessId }: { businessId: string }) {
  return (
    <form action={`/api/admin/suspend-business`} method="POST">
      <input type="hidden" name="id" value={businessId} />
      <button type="submit" className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-300 rounded text-xs font-bold transition-colors">
        Suspend
      </button>
    </form>
  );
}
