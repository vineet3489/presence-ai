import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const HEYGEN = process.env.HEYGEN_API_KEY!;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  // Raw list response with high limit
  const listRes = await fetch('https://api.heygen.com/v1/talking_photo.list?limit=100', {
    headers: { 'X-Api-Key': HEYGEN },
  });
  const listRaw = await listRes.text();
  let listParsed: unknown = null;
  try { listParsed = JSON.parse(listRaw); } catch { listParsed = listRaw; }

  // What's stored in Supabase
  const { data: files } = await admin.storage.from('face-scans').list(user.id);
  const idFiles = files?.filter(f => f.name.includes('heygen') || f.name.includes('photo_id')) || [];
  const storedIds: { file: string; id: string }[] = [];
  for (const f of idFiles) {
    try {
      const { data: blob } = await admin.storage.from('face-scans').download(`${user.id}/${f.name}`);
      if (blob) storedIds.push({ file: f.name, id: (await blob.text()).trim() });
    } catch { /* skip */ }
  }

  const data = listParsed as { data?: unknown[] } | null;
  const photos = Array.isArray(data?.data) ? data.data : [];

  return NextResponse.json({
    heygen_list_status: listRes.status,
    photo_count: photos.length,
    photos: (photos as { id: string; image_url?: string; is_preset?: boolean }[]).map(p => ({
      id: p.id,
      is_preset: p.is_preset,
      type: p.image_url?.includes('avatar/v3') ? 'preset' : p.image_url?.includes('talking_photo') ? 'talking_photo' : p.image_url?.includes('url_upload') ? 'url_upload' : 'unknown',
    })),
    supabase_stored_ids: storedIds,
  });
}

// Force-delete a photo by ID and return raw HeyGen response
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { id?: string; deleteAll?: boolean };

  // deleteAll mode: delete everything in the list
  if (body.deleteAll) {
    const listRes = await fetch('https://api.heygen.com/v1/talking_photo.list?limit=100', {
      headers: { 'X-Api-Key': HEYGEN },
    });
    const listData = await listRes.json().catch(() => ({ data: [] })) as { data?: { id: string; is_preset?: boolean }[] };
    const all = Array.isArray(listData?.data) ? listData.data : [];
    const toDelete = all.filter(p => p.id && !p.is_preset);
    const results: { id: string; status: number; body: string }[] = [];
    for (const p of toDelete) {
      const res = await fetch(`https://api.heygen.com/v2/talking_photo/${p.id}`, {
        method: 'DELETE',
        headers: { 'X-Api-Key': HEYGEN },
      });
      const rawBody = await res.text();
      results.push({ id: p.id, status: res.status, body: rawBody || '(empty — likely 204 success)' });
      await new Promise(r => setTimeout(r, 800));
    }
    return NextResponse.json({ deleted: results.length, results });
  }

  if (!body.id) return NextResponse.json({ error: 'id or deleteAll required' }, { status: 400 });

  const res = await fetch(`https://api.heygen.com/v2/talking_photo/${body.id}`, {
    method: 'DELETE',
    headers: { 'X-Api-Key': HEYGEN },
  });
  const rawBody = await res.text();
  return NextResponse.json({
    status: res.status,
    ok: res.ok,
    body: rawBody || '(empty — likely 204 success)',
  });
}
