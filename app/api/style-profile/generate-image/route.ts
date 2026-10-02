import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { callClaude } from '@/lib/claude/client';

export interface LookSpec {
  hair: string;
  outfit: string;
  accessory: string;
  grooming: string;
  pose: string;
  tips: string[];
}

const LOOK_SPEC_SYSTEM = `You are a celebrity stylist art-directing an aspirational portrait. From the coaching notes, decide ONE perfect, flattering look for this exact person and describe it as precise visual instructions — not advice, not critique.

Respond with valid JSON only:
{
  "hair": "string (exact cut + how it's styled, max 14 words, e.g. 'textured crop, soft side part on the left, matte finish, clean tapered sides')",
  "outfit": "string (exact pieces + colors + fit, max 18 words, e.g. 'crisp ivory linen shirt, top button open, sleeves rolled, beige chinos')",
  "accessory": "string (one accessory that elevates the look, max 8 words, e.g. 'gold aviator sunglasses tucked in shirt placket')",
  "grooming": "string (max 12 words, e.g. 'neatly shaped short stubble, clean neckline, clear even skin')",
  "pose": "string (max 12 words, e.g. 'shoulders back, chin slightly up, relaxed confident half-smile')",
  "tips": ["4 bold, imperative style tips the user can copy in real life — max 7 words each, concrete and visual, e.g. 'Rock gold aviators', 'Part your hair left', 'Beige + white, brown loafers', 'Shoulders back, chin up'"]
}`;

async function buildLookSpec(notes: string): Promise<LookSpec | null> {
  try {
    const raw = await callClaude(LOOK_SPEC_SYSTEM, notes, 600);
    const match = raw.match(/\{[\s\S]*\}/);
    const spec = JSON.parse(match ? match[0] : raw) as LookSpec;
    if (!spec.hair || !spec.outfit || !Array.isArray(spec.tips)) return null;
    spec.tips = spec.tips.slice(0, 4);
    return spec;
  } catch (err) {
    console.error('[ideal-look] look spec failed, using raw notes', err);
    return null;
  }
}

const GEMINI_KEY = () => process.env.GOOGLE_AI_API_KEY!;
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const UPLOAD_BASE = 'https://generativelanguage.googleapis.com/upload/v1beta';

const NANO_BANANA_MODELS = [
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-image-preview',
  'gemini-3-pro-image',
  'gemini-3-pro-image-preview',
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-lite-image',
];

async function pickModel(): Promise<string> {
  try {
    const res = await fetch(`${BASE}/models?key=${GEMINI_KEY()}&pageSize=200`);
    if (res.ok) {
      const data = await res.json();
      const available = new Set(
        (data.models || []).map((m: { name: string }) => m.name.replace('models/', ''))
      );
      for (const m of NANO_BANANA_MODELS) {
        if (available.has(m)) {
          console.log('[ideal-look] model:', m);
          return m;
        }
      }
    }
  } catch { /* fall through */ }
  return NANO_BANANA_MODELS[0];
}

// Upload image to Google AI Files API — avoids inline base64 size limits
// Returns a file_uri that Nano Banana can reference directly
async function uploadToGeminiFiles(imageBuffer: Buffer, mimeType: string): Promise<string> {
  // Step 1: initiate resumable upload
  const initRes = await fetch(
    `${UPLOAD_BASE}/files?key=${GEMINI_KEY()}`,
    {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(imageBuffer.length),
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: { display_name: 'face-scan' } }),
    }
  );

  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`Files API init failed ${initRes.status}: ${err.slice(0, 200)}`);
  }

  const uploadUrl = initRes.headers.get('x-goog-upload-url');
  if (!uploadUrl) throw new Error('Files API did not return upload URL');

  // Step 2: upload the bytes
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': String(imageBuffer.length),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: new Uint8Array(imageBuffer),
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Files API upload failed ${uploadRes.status}: ${err.slice(0, 200)}`);
  }

  const uploadData = await uploadRes.json();
  const uri = uploadData?.file?.uri;
  if (!uri) throw new Error(`Files API returned no URI: ${JSON.stringify(uploadData).slice(0, 200)}`);

  console.log('[ideal-look] uploaded to Files API:', uri);
  return uri as string;
}

async function editImage(
  model: string,
  fileUri: string,
  mimeType: string,
  prompt: string,
): Promise<{ base64: string; mime: string }> {
  const body = JSON.stringify({
    contents: [{
      parts: [
        { file_data: { mime_type: mimeType, file_uri: fileUri } },
        { text: prompt },
      ],
    }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  const res = await fetch(`${BASE}/models/${model}:generateContent?key=${GEMINI_KEY()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const raw = await res.text();
  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(raw); } catch { /* non-JSON */ }

  const candidate = (parsed.candidates as Record<string, unknown>[])?.[0];
  const finishReason = candidate?.finishReason as string | undefined;
  const parts = ((candidate?.content as Record<string, unknown>)?.parts ?? []) as Record<string, unknown>[];
  const textResponse = parts.filter(p => p.text).map(p => String(p.text)).join(' ');

  console.log(
    `[ideal-look] edit | model:${model} status:${res.status} finish:${finishReason ?? 'none'}`,
    `parts:${parts.length} text:${textResponse.slice(0, 150)}`,
    `raw:${raw.slice(0, 300)}`
  );

  if (!res.ok) throw new Error(`${model} ${res.status}: ${raw.slice(0, 250)}`);
  if (finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT') {
    throw new Error(`Safety filter (${finishReason}). Try regenerating.`);
  }

  for (const p of parts) {
    const id = (p.inline_data ?? p.inlineData) as { data?: string; mime_type?: string; mimeType?: string } | undefined;
    if (id?.data) return { base64: id.data, mime: id.mime_type ?? id.mimeType ?? 'image/jpeg' };
  }

  throw new Error(
    textResponse
      ? `Nano Banana declined: ${textResponse.slice(0, 200)}`
      : `No image in response (${parts.length} parts, finish: ${finishReason ?? 'none'}). Raw: ${raw.slice(0, 200)}`
  );
}

export async function POST() {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not configured' }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  const [
    { data: lastScan },
    { data: styleSessions },
    { data: profile },
  ] = await Promise.all([
    supabase.from('analysis_sessions').select('appearance_result')
      .eq('user_id', user.id).eq('session_type', 'appearance')
      .order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('analysis_sessions').select('date_prep_result')
      .eq('user_id', user.id).eq('session_type', 'date_prep')
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('user_profiles')
      .select('age, city, occupation, height_cm, weight_kg, primary_goal, style_preference')
      .eq('user_id', user.id).single(),
  ]);

  const appearance = lastScan?.appearance_result as Record<string, unknown> | null;
  if (!appearance) {
    return NextResponse.json({ error: 'Do a Face Scan first.' }, { status: 400 });
  }

  const rawPhotoPath = appearance.photoStoragePath as string | null;
  if (!rawPhotoPath) {
    return NextResponse.json({ error: 'Face scan photo not found. Please redo your Face Scan.' }, { status: 400 });
  }

  // Download face scan photo
  const { data: sd } = await admin.storage.from('face-scans').createSignedUrl(rawPhotoPath, 120);
  if (!sd?.signedUrl) {
    return NextResponse.json({ error: 'Could not access face scan. Please redo your Face Scan.' }, { status: 400 });
  }
  const photoRes = await fetch(sd.signedUrl);
  if (!photoRes.ok) {
    return NextResponse.json({ error: `Could not download face scan (${photoRes.status}).` }, { status: 400 });
  }
  const photoBuffer = Buffer.from(await photoRes.arrayBuffer());
  const faceMime = (photoRes.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
  console.log('[ideal-look] face scan size:', photoBuffer.length, 'bytes');

  // Style profile
  const styleSession = styleSessions?.find((s: Record<string, unknown>) => {
    const t = (s.date_prep_result as Record<string, unknown> | null)?.type;
    return typeof t === 'string' && t.startsWith('style_profile');
  });
  if (!styleSession) {
    return NextResponse.json({ error: 'Generate your Style Profile first.' }, { status: 400 });
  }

  const styleData = (styleSession.date_prep_result as Record<string, unknown>).data as {
    archetype: string;
    hairAdvice: string;
    grooming: string;
    colorPalette: { primary: string[] };
    signatureOutfits: { occasion: string; outfit: string }[];
  };

  const p = profile as Record<string, unknown> | null;
  const heightCm = p?.height_cm as number | null;
  const weightKg = p?.weight_kg as number | null;

  const bmi = heightCm && weightKg ? weightKg / ((heightCm / 100) ** 2) : null;
  const physique = bmi
    ? bmi < 18.5 ? 'lean slim'
    : bmi < 22   ? 'lean athletic'
    : bmi < 25   ? 'medium athletic'
    : bmi < 28   ? 'solid medium, broad-shouldered'
    : bmi < 32   ? 'solid full, strong frame'
    :              'heavy-set, commanding'
    : null;

  const hairstyle = (appearance.hairstyleRecommendations as string[] | null)?.[0] || styleData.hairAdvice;
  const grooming  = (appearance.groomingTips as string[] | null)?.[0] || styleData.grooming;
  const posture   = (appearance.postureCorrections as string[] | null)?.[0] || 'standing tall, shoulders back';
  const expression = (appearance.expressionTips as string[] | null)?.[0] || 'confident natural smile, direct eye contact';

  const outfit = styleData.signatureOutfits?.find(o =>
    o.occasion.toLowerCase().includes('casual') || o.occasion.toLowerCase().includes('date')
  )?.outfit || styleData.signatureOutfits?.[0]?.outfit || 'smart casual';

  const colors = styleData.colorPalette?.primary?.slice(0, 3).join(', ') || 'navy, white';

  const spec = await buildLookSpec([
    `Style archetype: ${styleData.archetype}`,
    `Hair coaching: ${hairstyle}`,
    `Grooming coaching: ${grooming}`,
    `Outfit idea: ${outfit}`,
    `Their best colours: ${colors}`,
    `Posture coaching: ${posture}`,
    `Expression coaching: ${expression}`,
    physique ? `Build: ${physique}` : '',
    p?.age ? `Age: ${p.age}` : '',
    p?.city ? `City: ${p.city}` : '',
  ].filter(Boolean).join('\n'));

  // Short edit instruction — keeps the model in edit mode, not generation mode
  const prompt = [
    'Edit this photo of one person into an aspirational, magazine-quality portrait of them at their absolute best. Keep the face exactly as-is — same identity, same features, no duplicates.',
    `Hair: ${spec?.hair ?? hairstyle}. Perfectly cut and styled, salon-fresh.`,
    `Grooming: ${spec?.grooming ?? grooming}`,
    `Outfit: ${spec?.outfit ?? `${outfit}, colours ${colors}`}${physique ? `, impeccably tailored for a ${physique} build` : ', impeccably tailored'}. Crisp, wrinkle-free fabric.`,
    spec?.accessory ? `Accessory: ${spec.accessory}.` : '',
    `Pose and expression: ${spec?.pose ?? `${posture}, ${expression}`}. Confident, warm, magnetic.`,
    'Background: plain dark navy seamless studio backdrop, flattering professional softbox lighting with soft rim light.',
    'Framing: chest-up portrait only. Crop at the chest — do not render legs, hips, hands, or any lower body.',
    'Output exactly one person, one clean crop — no ghosting, no duplicate limbs, no extra people or body parts anywhere in frame.',
  ].filter(Boolean).join('\n');

  try {
    const model = await pickModel();

    // Wipe all stale data before generating
    const uid = user.id;
    const { data: cacheFiles } = await admin.storage.from('face-scans').list(uid);
    const toDelete = (cacheFiles ?? [])
      .filter(f =>
        f.name === 'last-look.jpg' ||
        f.name.includes('ideal_look') ||
        f.name.startsWith('heygen_photo_id') ||
        f.name === 'current_heygen_photo_id.txt'
      )
      .map(f => `${uid}/${f.name}`);
    if (toDelete.length) await admin.storage.from('face-scans').remove(toDelete).catch(() => {});
    // Delete old avatar video — forces AvatarCard to show Generate button with fresh image
    await admin.storage.from('avatar-videos').remove([`${uid}/latest.mp4`]).catch(() => {});
    console.log('[ideal-look] cleared stale files:', toDelete.length, '+ avatar video');

    // Upload face scan to Google Files API — Nano Banana receives full image, no base64 size issues
    console.log('[ideal-look] uploading face scan to Files API, size:', photoBuffer.length, 'bytes');
    const fileUri = await uploadToGeminiFiles(photoBuffer, faceMime);

    console.log('[ideal-look] editing with model:', model);
    const result = await editImage(model, fileUri, faceMime, prompt);

    // Save generated image
    const storagePath = `${uid}/last-look.jpg`;
    const { error: uploadErr } = await admin.storage.from('face-scans').upload(
      storagePath,
      Buffer.from(result.base64, 'base64'),
      { contentType: result.mime, upsert: true }
    );
    if (uploadErr) throw new Error(`Could not save ideal look: ${uploadErr.message}`);

    const tips = spec?.tips ?? [];
    await admin.storage.from('face-scans').upload(
      `${uid}/last-look-tips.json`,
      Buffer.from(JSON.stringify({ tips })),
      { contentType: 'application/json', upsert: true }
    ).catch(() => {});

    const { data: signed } = await admin.storage.from('face-scans').createSignedUrl(storagePath, 3600);

    return NextResponse.json({ url: signed?.signedUrl ?? null, archetype: styleData.archetype, tips, model });

  } catch (err) {
    console.error('[ideal-look]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
