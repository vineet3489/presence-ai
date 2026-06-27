import { NextResponse } from 'next/server';

const HEYGEN = process.env.HEYGEN_API_KEY!;

async function heygenGet(path: string) {
  const res = await fetch(`https://api.heygen.com${path}`, {
    headers: { 'X-Api-Key': HEYGEN },
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function deleteTalkingPhoto(id: string): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(`https://api.heygen.com/v1/talking_photo/${id}`, {
    method: 'DELETE',
    headers: { 'X-Api-Key': HEYGEN },
  });
  const text = await res.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch { /* raw */ }
  return { ok: res.ok, status: res.status, body };
}

export async function POST() {
  if (!HEYGEN) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  // Try multiple possible list endpoints
  const [v1List, v2List] = await Promise.all([
    heygenGet('/v1/talking_photo.list'),
    heygenGet('/v2/talking_photo'),
  ]);

  console.log('[cleanup] v1 talking_photo.list:', v1List.status, JSON.stringify(v1List.data).slice(0, 300));
  console.log('[cleanup] v2 talking_photo:', v2List.status, JSON.stringify(v2List.data).slice(0, 300));

  // Collect IDs from any endpoint that returned data
  const ids: string[] = [];
  const v1data = v1List.data as Record<string, unknown>;
  const v2data = v2List.data as Record<string, unknown>;

  const fromV1 = (v1data?.data as Record<string, unknown>)?.list as { talking_photo_id: string }[] | undefined;
  const fromV2 = (v2data?.data as Record<string, unknown>)?.list as { talking_photo_id: string }[] | undefined
    ?? (v2data?.data as { talking_photo_id: string }[] | undefined);

  for (const p of fromV1 ?? []) if (p.talking_photo_id) ids.push(p.talking_photo_id);
  for (const p of fromV2 ?? []) if (p.talking_photo_id && !ids.includes(p.talking_photo_id)) ids.push(p.talking_photo_id);

  console.log('[cleanup] IDs to delete:', ids);

  const results = await Promise.all(ids.map(id => deleteTalkingPhoto(id).then(r => ({ id, ...r }))));

  return NextResponse.json({
    deleted: results.filter(r => r.ok).length,
    total_found: ids.length,
    results,
    raw: { v1: v1List, v2: v2List },
  });
}

export async function GET() {
  if (!HEYGEN) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  const [v1, v2] = await Promise.all([
    heygenGet('/v1/talking_photo.list'),
    heygenGet('/v2/talking_photo'),
  ]);
  return NextResponse.json({ v1, v2 });
}
