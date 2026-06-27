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

async function deleteTalkingPhoto(id: string): Promise<boolean> {
  const res = await fetch(`https://api.heygen.com/v1/talking_photo/${id}`, {
    method: 'DELETE',
    headers: { 'X-Api-Key': HEYGEN },
  });
  console.log('[cleanup-heygen] DELETE', id, '→', res.status);
  return res.ok;
}

export async function POST() {
  if (!HEYGEN) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const photos = await listUserTalkingPhotos();
  console.log('[cleanup-heygen] found', photos.length, 'user-uploaded talking photos to delete');

  const results = await Promise.all(
    photos.map(async (p) => {
      const ok = await deleteTalkingPhoto(p.id);
      return { id: p.id, deleted: ok };
    })
  );

  return NextResponse.json({
    deleted: results.filter(r => r.deleted).length,
    total_found: photos.length,
    results,
  });
}

export async function GET() {
  if (!HEYGEN) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  const photos = await listUserTalkingPhotos();
  return NextResponse.json({ count: photos.length, photos: photos.map(p => ({ id: p.id })) });
}
