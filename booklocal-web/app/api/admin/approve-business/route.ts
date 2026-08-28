import { createClient } from '../../../../lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const id = formData.get('id') as string;

  const supabase = createClient();
  const { error } = await supabase
    .from('businesses')
    .update({ is_approved: true })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.redirect(new URL('/admin/businesses', req.url));
}
