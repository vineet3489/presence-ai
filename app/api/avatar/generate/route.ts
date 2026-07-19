import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const HEYGEN = process.env.HEYGEN_API_KEY!;

interface UserContext {
  archetype: string;
  goal: string;
  voiceFixes: string[];
  voiceStrengths: string[];
  postureCue?: string;
  expressionCue?: string;
  heightCm?: number | null;
  weightKg?: number | null;
  age?: number | null;
  city?: string | null;
  occupation?: string | null;
  styleVibe?: string | null;
}

async function buildScript(ctx: UserContext): Promise<string> {
  const goalContext = ctx.goal?.includes('date')
    ? 'approaching someone they find attractive at a social setting'
    : ctx.goal?.includes('career') || ctx.goal?.includes('interview')
    ? 'making a strong first impression at a professional or social setting'
    : 'making a confident, natural first impression in a social setting';

  const vibeMap: Record<string, string> = {
    classic: 'understated and effortlessly cool',
    bold: 'bold and unapologetically magnetic',
    'smart-casual': 'sharp, intentional, always put-together',
    streetwear: 'adaptable and confidently experimental',
  };
  const vibeDesc = ctx.styleVibe ? vibeMap[ctx.styleVibe] || ctx.styleVibe : null;

  const lines = [
    `Write a 15-second spoken script (~38–42 words) for someone ${goalContext}.`,
    `Their style archetype: "${ctx.archetype}".`,
    ctx.age ? `Age: ${ctx.age}.` : '',
    ctx.city ? `Based in ${ctx.city}.` : '',
    ctx.occupation ? `Works as: ${ctx.occupation}.` : '',
    vibeDesc ? `Natural energy: ${vibeDesc}.` : '',
    ctx.voiceFixes.length > 0
      ? `Voice coaching applied: zero ${ctx.voiceFixes.slice(0, 2).join(' and ')}. Confident, direct sentence endings.`
      : '',
    ctx.voiceStrengths.length > 0
      ? `Natural speaking strength: ${ctx.voiceStrengths[0]}. Lean into this.`
      : '',
    ctx.postureCue ? `Posture/presence cue to weave in: ${ctx.postureCue}` : '',
    ctx.expressionCue ? `Expression/energy: ${ctx.expressionCue}` : '',
    ctx.heightCm && ctx.weightKg
      ? `Physical presence: ${ctx.heightCm}cm, ${ctx.weightKg}kg — script energy should match their frame.`
      : '',
    '',
    'The person is shown standing confidently, full body visible, in a premium studio setting.',
    'The script should match that energy — grounded, unhurried, taking up space.',
    '',
    'Rules:',
    '- Confident vocabulary only — no hedging, no "maybe", "kind of", "I think"',
    '- Zero filler words (no um, uh, like, basically, you know, so)',
    '- Declarative sentence endings — never upward questioning tone',
    '- One subtle posture/presence cue naturally embedded in the words',
    '- Specific observational opener → genuine curiosity → ONE direct engaging question',
    '- Sounds like their best, most articulate self — not scripted or salesy',
    '- First person, present tense',
    '- Return ONLY the spoken words. No quotes, no stage directions.',
  ].filter(Boolean).join('\n');

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    messages: [{ role: 'user', content: lines }],
  });
  return ((msg.content[0] as { text: string }).text).trim();
}

// List existing HeyGen talking photos (user-uploaded only, not presets)
// HeyGen returns ALL 5000+ preset avatars in this endpoint — filter aggressively
async function listHeygenPhotoAvatars(): Promise<{ id: string }[]> {
  try {
    const res = await fetch('https://api.heygen.com/v1/talking_photo.list', {
      headers: { 'X-Api-Key': HEYGEN },
    });
    if (!res.ok) {
      console.error('[avatar/generate] talking_photo.list HTTP error:', res.status);
      return [];
    }
    const body = await res.json();

    // HeyGen returns data as flat array (may contain 5000+ preset avatars)
    const raw = body?.data;
    let all: { id: string; is_preset?: boolean; image_url?: string }[] = [];
    if (Array.isArray(raw)) {
      all = raw;
    } else if (raw && typeof raw === 'object') {
      const r = raw as Record<string, unknown>;
      const nested = r.talking_photos ?? r.list ?? r.photos ?? r.items ?? [];
      if (Array.isArray(nested)) all = nested as typeof all;
    }

    // Filter: exclude presets AND HeyGen's built-in avatar types (identified by URL pattern)
    const userAvatars = all.filter(p =>
      p.id &&
      !p.is_preset &&
      // Exclude HeyGen's preset avatar URLs (avatar/v3/ pattern = built-in avatars)
      !p.image_url?.includes('/avatar/v3/')
    );

    console.log('[avatar/generate] total photos in list:', all.length, '| user-uploaded:', userAvatars.length, userAvatars.map(p => p.id));
    return userAvatars;
  } catch (e) {
    console.error('[avatar/generate] list photo avatars failed:', e);
    return [];
  }
}

// Delete a HeyGen talking photo to free up quota
async function deleteHeygenPhotoAvatar(id: string): Promise<void> {
  try {
    const res = await fetch(`https://api.heygen.com/v1/talking_photo/${id}`, {
      method: 'DELETE',
      headers: { 'X-Api-Key': HEYGEN },
    });
    console.log('[avatar/generate] deleted talking_photo', id, res.status);
  } catch (e) {
    console.error('[avatar/generate] delete photo avatar failed:', id, e);
  }
}

// Delete all known HeyGen photo avatars using stored IDs + list endpoint (sequential, not concurrent)
async function clearAllHeygenPhotos(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<string[]> {
  const deletedIds: string[] = [];

  // Strategy 1: delete by IDs stored in Supabase
  try {
    const { data: files } = await admin.storage.from('face-scans').list(userId);
    const idFiles = files?.filter(f =>
      f.name.startsWith('heygen_photo_id') || f.name === 'current_heygen_photo_id.txt'
    ) || [];
    for (const f of idFiles) {
      try {
        const { data: blob } = await admin.storage.from('face-scans').download(`${userId}/${f.name}`);
        if (blob) {
          const id = (await blob.text()).trim();
          if (id && id.length > 4 && !deletedIds.includes(id)) {
            await deleteHeygenPhotoAvatar(id);
            deletedIds.push(id);
            await new Promise(r => setTimeout(r, 500));
          }
        }
      } catch { /* non-fatal */ }
    }
  } catch (e) {
    console.error('[avatar/generate] stored ID delete failed:', e);
  }

  // Strategy 2: list endpoint — sequential deletions, 500ms between each
  const listed = await listHeygenPhotoAvatars();
  const extra = listed.filter(p => !deletedIds.includes(p.id));
  console.log('[avatar/generate] list found', extra.length, 'additional photos to delete:', extra.map(p => p.id));
  for (const p of extra) {
    await deleteHeygenPhotoAvatar(p.id);
    deletedIds.push(p.id);
    await new Promise(r => setTimeout(r, 500));
  }

  if (deletedIds.length > 0) {
    console.log('[avatar/generate] cleared', deletedIds.length, 'HeyGen photos, waiting 10s for propagation');
    await new Promise(r => setTimeout(r, 10000));
  }

  return deletedIds;
}

async function doHeygenUpload(photoBuffer: Buffer, photoMime: string): Promise<{ id: string | null; raw: string; status: number }> {
  const res = await fetch('https://upload.heygen.com/v1/talking_photo', {
    method: 'POST',
    headers: { 'X-Api-Key': HEYGEN, 'Content-Type': photoMime },
    body: new Uint8Array(photoBuffer),
  });
  const text = await res.text();
  console.log('[avatar/generate] talking_photo upload:', res.status, text.slice(0, 300));
  let data: { data?: { talking_photo_id?: string }; message?: string; error?: string } = {};
  try { data = JSON.parse(text); } catch { /* raw */ }
  return { id: data.data?.talking_photo_id ?? null, raw: text, status: res.status };
}

// Upload photo to HeyGen — pre-clears quota, retries once if still over limit
async function uploadTalkingPhoto(
  photoBuffer: Buffer,
  photoMime: string,
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<string> {
  await clearAllHeygenPhotos(admin, userId);

  let result = await doHeygenUpload(photoBuffer, photoMime);

  // Still hitting the limit — try one more aggressive pass then upload
  if (!result.id && (result.raw.includes('limit') || result.raw.includes('exceeded') || result.raw.includes('upgrade'))) {
    console.log('[avatar/generate] limit error after pre-clear — second aggressive pass');
    const listed = await listHeygenPhotoAvatars();
    console.log('[avatar/generate] second pass list:', listed.length, listed.map(p => p.id));

    if (listed.length > 0) {
      for (const p of listed) {
        await deleteHeygenPhotoAvatar(p.id);
        await new Promise(r => setTimeout(r, 1000));
      }
      console.log('[avatar/generate] second pass deletions done, waiting 8s');
      await new Promise(r => setTimeout(r, 8000));
      result = await doHeygenUpload(photoBuffer, photoMime);
    }

    // Do NOT fall back to a stale photo — that would use the wrong image silently
  }

  if (!result.id) {
    const isLimit = result.raw.includes('limit') || result.raw.includes('exceeded') || result.raw.includes('upgrade');
    throw new Error(isLimit
      ? 'HeyGen photo avatar limit reached. Go to app.heygen.com → Avatars → Photo Avatars, delete all existing ones, then try again.'
      : result.status === 401 ? 'HeyGen API key invalid or expired'
      : `Photo upload failed (${result.status}): ${result.raw.slice(0, 150)}`
    );
  }

  // Store the ID so reset-me can delete it by known ID next time
  await admin.storage.from('face-scans').upload(
    `${userId}/current_heygen_photo_id.txt`,
    Buffer.from(result.id),
    { contentType: 'text/plain', upsert: true }
  ).catch(() => {});

  return result.id;
}

async function cloneVoice(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  audioPath: string,
): Promise<string | null> {
  try {
    const { data: signed } = await admin.storage.from('face-scans').createSignedUrl(audioPath, 300);
    if (!signed?.signedUrl) return null;

    const audioRes = await fetch(signed.signedUrl);
    if (!audioRes.ok) return null;
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

    if (audioBuffer.length < 20000) {
      console.log('[avatar/generate] voice recording too short for cloning');
      return null;
    }

    const ext = audioPath.endsWith('.mp4') ? 'mp4' : audioPath.endsWith('.webm') ? 'webm' : 'wav';
    const form = new FormData();
    form.append('name', `PresenceAI_${userId.slice(0, 8)}`);
    form.append('file', new Blob([audioBuffer], { type: `audio/${ext}` }), `voice.${ext}`);

    for (const endpoint of ['voice_clone']) {
      const res = await fetch(`https://api.heygen.com/v2/${endpoint}`, {
        method: 'POST',
        headers: { 'X-Api-Key': HEYGEN },
        body: form,
      });
      const text = await res.text();
      console.log(`[avatar/generate] ${endpoint}:`, res.status, text.slice(0, 200));

      if (res.ok) {
        let data: { data?: { voice_id?: string } } = {};
        try { data = JSON.parse(text); } catch { continue; }
        if (data.data?.voice_id) return data.data.voice_id;
      }
    }
    return null;
  } catch (e) {
    console.error('[avatar/generate] voice clone error (non-fatal):', e);
    return null;
  }
}

async function getPresetVoice(): Promise<string | null> {
  try {
    const res = await fetch('https://api.heygen.com/v2/voices', { headers: { 'X-Api-Key': HEYGEN } });
    const data = await res.json();
    const voices: { voice_id: string; language?: string; gender?: string; name?: string }[] =
      data.data?.voices || data.voices || [];
    console.log('[avatar/generate] available voices:', voices.slice(0, 10).map(v => `${v.name}/${v.gender}/${v.language}`));

    const malev = voices.filter(v => v.gender?.toLowerCase() === 'male');
    // Prefer Indian / South Asian English voices for warmth and familiarity
    return (
      malev.find(v => v.language?.toLowerCase().includes('indian') || v.name?.toLowerCase().includes('indian'))
      || malev.find(v => v.language?.toLowerCase().includes('south') || v.name?.toLowerCase().includes('aryan') || v.name?.toLowerCase().includes('rohan') || v.name?.toLowerCase().includes('arun'))
      // Warm English voices over flat American TTS voices
      || malev.find(v => ['marcus','daniel','ethan','liam','noah'].some(n => v.name?.toLowerCase().includes(n)))
      || malev.find(v => v.language?.toLowerCase().includes('english'))
      || malev[0]
      || voices[0]
    )?.voice_id ?? null;
  } catch { return null; }
}

// Clear all cached HeyGen IDs from Supabase storage for this user
async function clearHeygenCache(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<void> {
  try {
    const { data: files } = await admin.storage.from('face-scans').list(userId);
    const cacheFiles = files?.filter(f =>
      f.name.startsWith('heygen_photo_id_') ||
      f.name.startsWith('cloned_voice_id_') ||
      f.name === 'current_heygen_photo_id.txt'
    ) || [];
    if (cacheFiles.length > 0) {
      const paths = cacheFiles.map(f => `${userId}/${f.name}`);
      await admin.storage.from('face-scans').remove(paths);
      console.log('[avatar/generate] cleared', paths.length, 'cached HeyGen IDs');
    }
  } catch (e) {
    console.error('[avatar/generate] cache clear failed (non-fatal):', e);
  }
}

export async function POST(request: Request) {
  const forceUpload = new URL(request.url).searchParams.get('force') === '1';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!HEYGEN) return NextResponse.json({ error: 'HeyGen API not configured' }, { status: 500 });

  // Fetch everything we need in parallel — all profile fields for rich script
  const [
    { data: lastScan },
    { data: voiceSession },
    { data: styleSession },
    { data: profile },
  ] = await Promise.all([
    supabase.from('analysis_sessions').select('appearance_result')
      .eq('user_id', user.id).eq('session_type', 'appearance')
      .order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('analysis_sessions').select('voice_result')
      .eq('user_id', user.id).eq('session_type', 'voice')
      .order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('analysis_sessions').select('date_prep_result')
      .eq('user_id', user.id).eq('session_type', 'date_prep')
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('user_profiles')
      .select('goals, primary_goal, height_cm, weight_kg, age, city, occupation, style_preference')
      .eq('user_id', user.id).single(),
  ]);

  const rawPhotoPath = (lastScan?.appearance_result as Record<string, unknown>)?.photoStoragePath as string | null;
  if (!rawPhotoPath) {
    return NextResponse.json({
      error: 'no_photo',
      message: 'Do a Face Scan first — we need your photo to build the avatar.',
    }, { status: 400 });
  }

  // Build context from all data sources
  const styleProfileSession = styleSession?.find((s: Record<string, unknown>) => {
    const t = (s.date_prep_result as Record<string, unknown> | null)?.type;
    return typeof t === 'string' && t.startsWith('style_profile');
  });
  const styleData = (styleProfileSession?.date_prep_result as Record<string, unknown> | null)?.data as Record<string, unknown> | null;
  const archetype = (styleData?.archetype as string) ||
    (lastScan?.appearance_result as Record<string, unknown>)?.faceShape as string ||
    'The Confident Minimalist';

  const voiceResult = voiceSession?.voice_result as Record<string, unknown> | null;
  const audioPath = voiceResult?.audioStoragePath as string | null;
  const appearanceResult = lastScan?.appearance_result as Record<string, unknown> | null;
  const p = profile as Record<string, unknown> | null;

  const ctx: UserContext = {
    archetype,
    goal: ((p?.goals as string[])?.[0]) || (p?.primary_goal as string) || 'dating',
    voiceFixes: (voiceResult?.improvementsList as string[]) || [],
    voiceStrengths: (voiceResult?.strengthsList as string[]) || [],
    postureCue: (appearanceResult?.postureCorrections as string[] | null)?.[0],
    expressionCue: (appearanceResult?.expressionTips as string[] | null)?.[0],
    heightCm: p?.height_cm as number | null,
    weightKg: p?.weight_kg as number | null,
    age: p?.age as number | null,
    city: p?.city as string | null,
    occupation: p?.occupation as string | null,
    styleVibe: p?.style_preference as string | null,
  };

  try {
    const admin = createAdminClient();

    // Clear cached HeyGen IDs from Supabase so uploadTalkingPhoto re-uploads fresh
    if (forceUpload) {
      await clearHeygenCache(admin, user.id);
    }

    // 1. Build script with full context
    const script = await buildScript(ctx);
    console.log('[avatar/generate] script:', script);

    // 2. Get talking photo — always prefer Gemini ideal look (last-look.jpg) over raw face scan
    // Try to get a signed URL for last-look.jpg directly (more reliable than listing all files)
    const { data: idealLookSigned, error: idealLookErr } = await admin.storage
      .from('face-scans')
      .createSignedUrl(`${user.id}/last-look.jpg`, 300);
    const idealLookUrl = !idealLookErr && idealLookSigned?.signedUrl ? idealLookSigned.signedUrl : null;
    console.log('[avatar/generate] last-look.jpg exists:', !!idealLookUrl, '| force:', forceUpload);

    const photoSource = idealLookUrl ? 'ideal_look' : `raw_${rawPhotoPath.replace(/\//g, '_')}`;
    const cachedPhotoIdPath = `${user.id}/heygen_photo_id_${photoSource}.txt`;

    // Record which photo source this avatar uses — checked by last-video to detect stale videos
    await admin.storage.from('face-scans').upload(
      `${user.id}/avatar_photo_source.txt`,
      Buffer.from(photoSource),
      { contentType: 'text/plain', upsert: true }
    ).catch(() => {});

    let talkingPhotoId: string | undefined;

    if (!forceUpload) {
      try {
        const { data: cached } = await admin.storage.from('face-scans').download(cachedPhotoIdPath);
        if (cached) {
          const id = (await cached.text()).trim();
          if (id) talkingPhotoId = id;
        }
      } catch { /* no cache */ }
    }
    console.log('[avatar/generate] photoSource:', photoSource, '| cached talkingPhotoId:', talkingPhotoId ?? 'none');

    if (!talkingPhotoId) {
      let photoBuffer: Buffer | null = null;
      let photoMime = 'image/jpeg';

      // Prefer Gemini ideal look — signed URL already obtained above
      if (idealLookUrl) {
        try {
          const r = await fetch(idealLookUrl);
          if (r.ok) {
            photoBuffer = Buffer.from(await r.arrayBuffer());
            photoMime = 'image/jpeg'; // last-look.jpg is always stored as JPEG
            console.log('[avatar/generate] downloaded ideal look:', photoBuffer.length, 'bytes');
          } else {
            console.error('[avatar/generate] ideal look fetch failed:', r.status, r.statusText);
          }
        } catch (e) {
          console.error('[avatar/generate] ideal look download error:', e);
        }
      }

      // Fall back to raw face scan only if ideal look unavailable
      if (!photoBuffer) {
        console.log('[avatar/generate] ideal look unavailable — falling back to raw face scan:', rawPhotoPath);
        const { data: sd, error: se } = await admin.storage.from('face-scans').createSignedUrl(rawPhotoPath, 600);
        if (!se && sd?.signedUrl) {
          const r = await fetch(sd.signedUrl);
          if (r.ok) {
            photoBuffer = Buffer.from(await r.arrayBuffer());
            photoMime = (r.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
            console.log('[avatar/generate] using raw face scan:', photoBuffer.length, 'bytes');
          }
        }
      }

      if (!photoBuffer) {
        throw new Error('Could not access photo. Please redo your Face Scan.');
      }

      talkingPhotoId = await uploadTalkingPhoto(photoBuffer, photoMime, admin, user.id);
      console.log('[avatar/generate] uploaded talkingPhotoId:', talkingPhotoId);

      await admin.storage.from('face-scans').upload(
        cachedPhotoIdPath, Buffer.from(talkingPhotoId),
        { contentType: 'text/plain', upsert: true }
      ).catch(() => {});
    }

    // 3. Clone voice (best-effort, falls back to preset)
    const cachedVoiceIdPath = audioPath
      ? `${user.id}/cloned_voice_id_${audioPath.replace(/\//g, '_')}.txt`
      : null;
    let clonedVoiceId: string | null = null;

    if (cachedVoiceIdPath && !forceUpload) {
      try {
        const { data: cv } = await admin.storage.from('face-scans').download(cachedVoiceIdPath);
        if (cv) {
          const id = (await cv.text()).trim();
          if (id) clonedVoiceId = id;
        }
      } catch { /* no cache */ }
    }

    if (!clonedVoiceId && audioPath) {
      clonedVoiceId = await cloneVoice(admin, user.id, audioPath);
      if (clonedVoiceId && cachedVoiceIdPath) {
        await admin.storage.from('face-scans').upload(
          cachedVoiceIdPath, Buffer.from(clonedVoiceId),
          { contentType: 'text/plain', upsert: true }
        ).catch(() => {});
      }
    }

    const voiceId = clonedVoiceId ?? await getPresetVoice();
    const usingClonedVoice = !!clonedVoiceId;
    console.log('[avatar/generate] voice:', usingClonedVoice ? `cloned (${voiceId})` : `preset (${voiceId})`);
    if (!voiceId) throw new Error('No voice available. Please try again.');

    // 4. Generate video
    const videoRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: { 'X-Api-Key': HEYGEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_inputs: [{
          character: { type: 'talking_photo', talking_photo_id: talkingPhotoId },
          voice: { type: 'text', input_text: script, voice_id: voiceId, speed: 1.0 },
          background: { type: 'color', value: '#0f172a' },
        }],
        dimension: { width: 720, height: 1280 },
        test: false,
      }),
    });

    const videoText = await videoRes.text();
    console.log('[avatar/generate] video/generate:', videoRes.status, videoText.slice(0, 300));

    let videoData: { data?: { video_id?: string }; error?: { message?: string } } = {};
    try { videoData = JSON.parse(videoText); } catch {
      throw new Error(`Video generation failed (${videoRes.status}): ${videoText.slice(0, 150)}`);
    }

    const videoId = videoData.data?.video_id;
    if (!videoId) throw new Error(`Video generation failed: ${JSON.stringify(videoData).slice(0, 200)}`);

    return NextResponse.json({ videoId, script, usingClonedVoice });

  } catch (err) {
    console.error('[avatar/generate]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Avatar generation failed' },
      { status: 500 }
    );
  }
}
