import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const HEYGEN = process.env.HEYGEN_API_KEY!;

// The plan's "3 photo avatars" limit is counted against the avatar_group object
// (same id as the talking_photo), not the talking_photo object itself — both
// must be deleted to actually free up the quota.
async function deleteHeygenPhotoById(id: string): Promise<boolean> {
  let ok = false;
  try {
    const res = await fetch(`https://api.heygen.com/v2/talking_photo/${id}`, {
      method: 'DELETE',
      headers: { 'X-Api-Key': HEYGEN },
    });
    console.log('[reset-me] DELETE heygen talking_photo', id, '→', res.status);
    ok = res.ok || ok;
  } catch { /* non-fatal */ }
  try {
    const res = await fetch(`https://api.heygen.com/v2/avatar_group/${id}`, {
      method: 'DELETE',
      headers: { 'X-Api-Key': HEYGEN },
    });
    console.log('[reset-me] DELETE heygen avatar_group', id, '→', res.status);
    ok = res.ok || ok;
  } catch { /* non-fatal */ }
  return ok;
}

async function clearHeygenPhotoAvatars(admin: ReturnType<typeof createAdminClient>, uid: string): Promise<string> {
  const deleted: string[] = [];

  // Strategy 1: delete any IDs we've stored in Supabase (most reliable)
  try {
    const { data: files } = await admin.storage.from('face-scans').list(uid);
    const idFiles = files?.filter(f =>
      f.name.startsWith('heygen_photo_id') || f.name === 'current_heygen_photo_id.txt'
    ) || [];

    for (const f of idFiles) {
      try {
        const { data: blob } = await admin.storage.from('face-scans').download(`${uid}/${f.name}`);
        if (blob) {
          const id = (await blob.text()).trim();
          if (id && id.length > 4) {
            const ok = await deleteHeygenPhotoById(id);
            if (ok) deleted.push(id);
          }
        }
      } catch { /* non-fatal */ }
    }
  } catch (e) {
    console.error('[reset-me] reading stored IDs failed:', e);
  }

  // Strategy 2: list from HeyGen API as belt-and-suspenders (handles multiple response formats)
  try {
    const listRes = await fetch('https://api.heygen.com/v1/talking_photo.list', {
      headers: { 'X-Api-Key': HEYGEN },
    });
    if (listRes.ok) {
      const body = await listRes.json();
      console.log('[reset-me] talking_photo.list raw:', JSON.stringify(body).slice(0, 500));

      const raw = body?.data;
      let all: { id: string; is_preset?: boolean }[] = [];
      if (Array.isArray(raw)) {
        all = raw;
      } else if (raw && typeof raw === 'object') {
        const r = raw as Record<string, unknown>;
        const nested = r.talking_photos ?? r.list ?? r.photos ?? r.items ?? [];
        if (Array.isArray(nested)) all = nested as { id: string; is_preset?: boolean }[];
      }

      const toDelete = all.filter(p => p.id && !p.is_preset && !deleted.includes(p.id));
      console.log('[reset-me] list endpoint found additional:', toDelete.length);
      for (const p of toDelete) {
        const ok = await deleteHeygenPhotoById(p.id);
        if (ok) deleted.push(p.id);
      }
    }
  } catch (e) {
    console.error('[reset-me] list endpoint failed:', e);
  }

  return deleted.length > 0
    ? `HeyGen: deleted ${deleted.length} photo avatars (${deleted.join(', ')})`
    : 'HeyGen: no photo avatars found to delete';
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const uid = user.id;
  const log: string[] = [];

  // 1. Delete all HeyGen photo avatars (reads stored IDs + list endpoint)
  log.push(await clearHeygenPhotoAvatars(admin, uid));

  // 2. Delete all files in face-scans/{uid}/
  try {
    const { data: faceFiles } = await admin.storage.from('face-scans').list(uid);
    if (faceFiles && faceFiles.length > 0) {
      const paths = faceFiles.map(f => `${uid}/${f.name}`);
      await admin.storage.from('face-scans').remove(paths);
      log.push(`Deleted ${paths.length} face-scan files`);
    } else {
      log.push('No face-scan files to delete');
    }
  } catch (e) {
    log.push(`face-scans error: ${e}`);
  }

  // 3. Delete avatar video
  try {
    await admin.storage.from('avatar-videos').remove([`${uid}/latest.mp4`]);
    log.push('Deleted avatar video');
  } catch (e) {
    log.push(`avatar video error: ${e}`);
  }

  // 4. Delete all analysis sessions
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from('analysis_sessions').delete().eq('user_id', uid);
    log.push(error ? `analysis_sessions error: ${error.message}` : 'Deleted analysis_sessions');
  } catch (e) {
    log.push(`analysis_sessions error: ${e}`);
  }

  // 5. Delete user profile (so onboarding reruns on next login)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from('user_profiles').delete().eq('user_id', uid);
    log.push(error ? `user_profiles error: ${error.message}` : 'Deleted user_profile');
  } catch (e) {
    log.push(`user_profiles error: ${e}`);
  }

  // 6. Sign out
  await supabase.auth.signOut();

  console.log('[reset-me] log:', log);
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL('/login', origin), 303);
}
