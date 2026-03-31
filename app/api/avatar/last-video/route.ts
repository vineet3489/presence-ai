import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ url: null });

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from('avatar-videos')
      .createSignedUrl(`${user.id}/latest.mp4`, 3600);
    if (error || !data?.signedUrl) return NextResponse.json({ url: null });
    return NextResponse.json({ url: data.signedUrl });
  } catch {
    return NextResponse.json({ url: null });
  }
}
