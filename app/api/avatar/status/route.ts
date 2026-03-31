import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const HEYGEN = process.env.HEYGEN_API_KEY!;

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');
  if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 });

  const res = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
    { headers: { 'X-Api-Key': HEYGEN } }
  );
  const data = await res.json();
  const status: string = data.data?.status || 'processing';
  const heygenUrl: string | undefined = data.data?.video_url;

  if (status === 'completed' && heygenUrl) {
    // Download from HeyGen and persist to Supabase Storage
    try {
      const admin = createAdminClient();
      const storagePath = `${user.id}/latest.mp4`;

      const videoRes = await fetch(heygenUrl);
      const buf = Buffer.from(await videoRes.arrayBuffer());

      await admin.storage
        .from('avatar-videos')
        .upload(storagePath, buf, { contentType: 'video/mp4', upsert: true });

      const { data: signed } = await admin.storage
        .from('avatar-videos')
        .createSignedUrl(storagePath, 3600);

      return NextResponse.json({ status: 'completed', videoUrl: signed?.signedUrl || heygenUrl });
    } catch (e) {
      console.error('[avatar/status] storage save failed (returning HeyGen URL):', e);
      return NextResponse.json({ status: 'completed', videoUrl: heygenUrl });
    }
  }

  if (status === 'failed') {
    return NextResponse.json({ status: 'failed', error: data.data?.error || 'Generation failed' });
  }

  return NextResponse.json({ status });
}
