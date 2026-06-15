import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ url: null }, { status: 401 });

  const path = req.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ url: null }, { status: 400 });

  // Only allow access to the requesting user's own files
  if (!path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ url: null }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from('face-scans').createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return NextResponse.json({ url: null });
  return NextResponse.json({ url: data.signedUrl });
}
