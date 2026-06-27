import { NextResponse } from 'next/server';

const HEYGEN = process.env.HEYGEN_API_KEY!;

// List all talking photos from HeyGen
async function listTalkingPhotos(): Promise<{ talking_photo_id: string }[]> {
  const res = await fetch('https://api.heygen.com/v1/talking_photo.list', {
    headers: { 'X-Api-Key': HEYGEN },
  });
  const data = await res.json();
  return data.data?.list ?? [];
}

// Delete a single talking photo
async function deleteTalkingPhoto(id: string): Promise<boolean> {
  const res = await fetch(`https://api.heygen.com/v1/talking_photo/${id}`, {
    method: 'DELETE',
    headers: { 'X-Api-Key': HEYGEN },
  });
  return res.ok;
}

export async function POST() {
  if (!HEYGEN) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const photos = await listTalkingPhotos();
  console.log('[cleanup-heygen] found', photos.length, 'talking photos');

  const results = await Promise.all(
    photos.map(async (p) => {
      const ok = await deleteTalkingPhoto(p.talking_photo_id);
      console.log('[cleanup-heygen] deleted', p.talking_photo_id, '→', ok);
      return { id: p.talking_photo_id, deleted: ok };
    })
  );

  return NextResponse.json({ deleted: results.length, results });
}

// GET just lists without deleting — useful for inspection
export async function GET() {
  if (!HEYGEN) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  const photos = await listTalkingPhotos();
  return NextResponse.json({ count: photos.length, photos });
}
