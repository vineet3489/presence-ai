import { NextResponse } from 'next/server';

const HEYGEN = process.env.HEYGEN_API_KEY!;

interface HeyGenPhoto {
  id: string;
  image_url?: string;
  is_preset?: boolean;
  video_url?: string;
}

async function listUserTalkingPhotos(): Promise<HeyGenPhoto[]> {
  const res = await fetch('https://api.heygen.com/v1/talking_photo.list', {
    headers: { 'X-Api-Key': HEYGEN },
  });
  const data = await res.json();
  const all: HeyGenPhoto[] = data?.data ?? [];
  // Only return user-uploaded photos — skip HeyGen presets
  return all.filter(p => !p.is_preset);
}

// The plan's "3 photo avatars" limit is counted against avatar_group objects
// (same id as the talking_photo), not the talking_photo object itself.
async function listUserAvatarGroups(): Promise<{ id: string }[]> {
  const res = await fetch('https://api.heygen.com/v2/avatar_group.list?include_public=false', {
    headers: { 'X-Api-Key': HEYGEN },
  });
  const data = await res.json();
  const list: { id: string }[] = data?.data?.avatar_group_list ?? [];
  return list;
}

async function deleteTalkingPhoto(id: string): Promise<boolean> {
  const res = await fetch(`https://api.heygen.com/v2/talking_photo/${id}`, {
    method: 'DELETE',
    headers: { 'X-Api-Key': HEYGEN },
  });
  console.log('[cleanup-heygen] DELETE talking_photo', id, '→', res.status);
  return res.ok;
}

async function deleteAvatarGroup(id: string): Promise<boolean> {
  const res = await fetch(`https://api.heygen.com/v2/avatar_group/${id}`, {
    method: 'DELETE',
    headers: { 'X-Api-Key': HEYGEN },
  });
  console.log('[cleanup-heygen] DELETE avatar_group', id, '→', res.status);
  return res.ok;
}

export async function POST() {
  if (!HEYGEN) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const [photos, groups] = await Promise.all([listUserTalkingPhotos(), listUserAvatarGroups()]);
  const ids = Array.from(new Set([...photos.map(p => p.id), ...groups.map(g => g.id)]));
  console.log('[cleanup-heygen] found', ids.length, 'unique photo avatar ids to delete');

  const results = await Promise.all(
    ids.map(async (id) => {
      const [talkingPhotoDeleted, avatarGroupDeleted] = await Promise.all([
        deleteTalkingPhoto(id),
        deleteAvatarGroup(id),
      ]);
      return { id, talkingPhotoDeleted, avatarGroupDeleted };
    })
  );

  return NextResponse.json({
    deleted: results.filter(r => r.talkingPhotoDeleted || r.avatarGroupDeleted).length,
    total_found: ids.length,
    results,
  });
}

export async function GET() {
  if (!HEYGEN) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  const [photos, groups] = await Promise.all([listUserTalkingPhotos(), listUserAvatarGroups()]);
  return NextResponse.json({
    talking_photo_count: photos.length,
    avatar_group_count: groups.length,
    photos: photos.map(p => ({ id: p.id })),
    groups,
  });
}
