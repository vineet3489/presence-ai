import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from('face-scans')
      .createSignedUrl(`${user.id}/last-look.jpg`, 3600);

    if (error || !data?.signedUrl) return NextResponse.json({ url: null });
    return NextResponse.json({ url: data.signedUrl });
  } catch {
    return NextResponse.json({ url: null });
  }
}

// DELETE — wipes stale ideal look image + avatar cache so both start fresh
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const uid = user.id;

  // 1. Delete old ideal look image
  await admin.storage.from('face-scans').remove([`${uid}/last-look.jpg`]).catch(() => {});

  // 2. Delete all HeyGen cache files so avatar re-uploads fresh image
  const { data: files } = await admin.storage.from('face-scans').list(uid);
  const cacheFiles = (files ?? [])
    .filter(f => f.name.includes('ideal_look') || f.name.startsWith('heygen_photo_id') || f.name === 'current_heygen_photo_id.txt')
    .map(f => `${uid}/${f.name}`);
  if (cacheFiles.length > 0) {
    await admin.storage.from('face-scans').remove(cacheFiles).catch(() => {});
  }

  // 3. Delete old avatar video so AvatarCard shows Generate button, not stale video
  await admin.storage.from('avatar-videos').remove([`${uid}/latest.mp4`]).catch(() => {});

  console.log('[last-look] cleared ideal look, heygen cache, avatar video:', cacheFiles.length, 'cache files');
  return NextResponse.json({ cleared: true });
}
