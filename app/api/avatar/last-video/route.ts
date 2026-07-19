import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ url: null, needsUpdate: false });

  try {
    const admin = createAdminClient();

    // Check if ideal look (last-look.jpg) exists
    const { error: idealErr } = await admin.storage
      .from('face-scans')
      .createSignedUrl(`${user.id}/last-look.jpg`, 60);
    const hasIdealLook = !idealErr;

    // If ideal look exists, check whether the stored avatar was built from it
    if (hasIdealLook) {
      let avatarIsFromIdealLook = false;
      try {
        const { data: srcBlob, error: srcErr } = await admin.storage
          .from('face-scans')
          .download(`${user.id}/avatar_photo_source.txt`);
        if (!srcErr && srcBlob) {
          const src = (await srcBlob.text()).trim();
          avatarIsFromIdealLook = src === 'ideal_look';
        }
        // if srcErr or srcBlob null → file doesn't exist → not from ideal look
      } catch { /* treat as not from ideal look */ }

      if (!avatarIsFromIdealLook) {
        // Stale video — delete it server-side so it never reappears on reload
        await admin.storage.from('avatar-videos').remove([`${user.id}/latest.mp4`]).catch(() => {});
        console.log('[last-video] stale avatar detected (not from ideal look) — deleted latest.mp4');
        return NextResponse.json({ url: null, needsUpdate: true });
      }
    }

    // Return the video URL (either no ideal look, or video is correctly from ideal look)
    const { data, error } = await admin.storage
      .from('avatar-videos')
      .createSignedUrl(`${user.id}/latest.mp4`, 3600);
    if (error || !data?.signedUrl) return NextResponse.json({ url: null, needsUpdate: false });
    return NextResponse.json({ url: data.signedUrl, needsUpdate: false });

  } catch {
    return NextResponse.json({ url: null, needsUpdate: false });
  }
}

// DELETE — wipes latest.mp4 so page reload shows Generate button, not stale video
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  await admin.storage.from('avatar-videos').remove([`${user.id}/latest.mp4`]).catch(() => {});
  return NextResponse.json({ cleared: true });
}
