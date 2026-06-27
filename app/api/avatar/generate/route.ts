import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const HEYGEN = process.env.HEYGEN_API_KEY!;

async function buildScript(
  archetype: string,
  voiceFixes: string[],
  goal: string,
  voiceStrengths: string[],
  postureCue?: string,
  expressionCue?: string,
  heightCm?: number | null,
  weightKg?: number | null,
): Promise<string> {
  const goalContext = goal?.includes('date')
    ? 'approaching someone they find attractive at a social setting'
    : goal?.includes('confident') || goal?.includes('interview')
    ? 'making a strong, memorable first impression at a professional or social setting'
    : 'making a confident, natural first impression in a social setting';

  const fixes = voiceFixes.length > 0
    ? `Voice coaching applied: zero ${voiceFixes.slice(0, 2).join(' and ')}. Confident, direct sentence endings only.`
    : '';
  const strengths = voiceStrengths.length > 0
    ? `Natural speaking strength: ${voiceStrengths.slice(0, 1).join(', ')}. Lean into this.`
    : '';
  const postureNote = postureCue
    ? `Presence cue woven in naturally: ${postureCue}`
    : '';
  const expressionNote = expressionCue
    ? `Expression/energy: ${expressionCue}`
    : '';
  const bodyNote = heightCm && weightKg
    ? `Physical presence: ${heightCm}cm, ${weightKg}kg — script energy should match their frame.`
    : '';

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Write a 15-second spoken script (~38–42 words) for someone ${goalContext}.
Their style archetype: "${archetype}".
${fixes}
${strengths}
${postureNote}
${expressionNote}
${bodyNote}

Rules:
- Confident vocabulary only — no hedging ("maybe", "kind of", "I think"), no questions about "maybe"
- Zero filler words (no um, uh, like, basically, you know, so)
- Confident, declarative sentence endings — never upward questioning tone
- Include one subtle posture/presence cue naturally embedded in the words (e.g. how they stand, enter, hold themselves)
- Specific observational opener, genuine curiosity, ends with ONE direct engaging question
- Matches the archetype's energy authentically
- Sounds like their best, most articulate version — not scripted or salesy
- First person, present tense
- Voice coaching applied: zero fillers, confident sentence endings throughout
- Return ONLY the spoken words. No quotes, no stage directions, nothing else.`
    }]
  });
  return ((msg.content[0] as { text: string }).text).trim();
}

async function cloneVoiceFromRecording(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  audioPath: string
): Promise<string | null> {
  try {
    const { data: signedData } = await admin.storage
      .from('face-scans')
      .createSignedUrl(audioPath, 300);
    if (!signedData?.signedUrl) return null;

    const audioRes = await fetch(signedData.signedUrl);
    if (!audioRes.ok) return null;
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

    // Minimum ~5 seconds of audio needed for voice cloning
    if (audioBuffer.length < 40000) {
      console.log('[avatar/generate] voice recording too short for cloning, skipping');
      return null;
    }

    console.log('[avatar/generate] cloning voice from recording, size:', audioBuffer.length);

    // Determine file extension from path
    const ext = audioPath.endsWith('.mp4') ? 'mp4' : 'webm';
    const mimeType = ext === 'mp4' ? 'audio/mp4' : 'audio/webm';

    const form = new FormData();
    form.append('name', `PresenceAI_${userId.slice(0, 8)}`);
    form.append('file', new Blob([audioBuffer], { type: mimeType }), `voice.${ext}`);

    const cloneRes = await fetch('https://api.heygen.com/v2/voice_clone', {
      method: 'POST',
      headers: { 'X-Api-Key': HEYGEN },
      body: form,
    });
    const cloneText = await cloneRes.text();
    console.log('[avatar/generate] voice_clone response:', cloneRes.status, cloneText.slice(0, 200));

    let cloneData: { data?: { voice_id?: string }; code?: number; message?: string } = {};
    try { cloneData = JSON.parse(cloneText); } catch { return null; }

    return cloneData.data?.voice_id ?? null;
  } catch (e) {
    console.error('[avatar/generate] voice clone error (non-fatal):', e);
    return null;
  }
}

async function getPresetVoice(): Promise<string | null> {
  try {
    const res = await fetch('https://api.heygen.com/v2/voices', {
      headers: { 'X-Api-Key': HEYGEN },
    });
    const data = await res.json();
    const voices: { voice_id: string; language?: string; gender?: string; name?: string }[] =
      data.data?.voices || data.voices || [];
    // Prefer confident-sounding English male voice
    const pick = voices.find(v =>
      v.gender?.toLowerCase() === 'male' &&
      (v.name?.toLowerCase().includes('ryan') ||
       v.name?.toLowerCase().includes('josh') ||
       v.name?.toLowerCase().includes('adam') ||
       v.name?.toLowerCase().includes('james'))
    ) || voices.find(v =>
      v.gender?.toLowerCase() === 'male' &&
      (v.language?.toLowerCase().includes('english') || v.name?.toLowerCase().includes('en'))
    ) || voices.find(v => v.gender?.toLowerCase() === 'male')
      || voices[0];
    return pick?.voice_id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const forceUpload = new URL(request.url).searchParams.get('force') === '1';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!HEYGEN) return NextResponse.json({ error: 'AI video not configured' }, { status: 500 });

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
    supabase.from('user_profiles').select('goals, height_cm, weight_kg').eq('user_id', user.id).single(),
  ]);

  // Require face scan photo
  const rawPhotoPath = (lastScan?.appearance_result as Record<string, unknown>)?.photoStoragePath as string | null;
  if (!rawPhotoPath) {
    return NextResponse.json({
      error: 'no_photo',
      message: 'Do a Face Scan first — we need your photo to build the avatar.',
    }, { status: 400 });
  }

  // Get style archetype from cached style profile
  const styleProfileSession = styleSession?.find((s: Record<string, unknown>) => {
    const type = (s.date_prep_result as Record<string, unknown> | null)?.type;
    return typeof type === 'string' && type.startsWith('style_profile');
  });
  const archetype = (styleProfileSession?.date_prep_result as Record<string, unknown> | null)?.data
    ? ((styleProfileSession!.date_prep_result as Record<string, unknown>).data as Record<string, unknown>)?.archetype as string
    : (lastScan?.appearance_result as Record<string, unknown>)?.faceShape as string || 'The Confident Minimalist';

  const voiceResult = voiceSession?.voice_result as Record<string, unknown> | null;
  const voiceFixes: string[] = (voiceResult?.improvementsList as string[]) || [];
  const voiceStrengths: string[] = (voiceResult?.strengthsList as string[]) || [];
  const audioPath = voiceResult?.audioStoragePath as string | null;
  const goal: string = (profile?.goals as string[])?.[0] || '';
  const heightCm = (profile as Record<string, unknown> | null)?.height_cm as number | null ?? null;
  const weightKg = (profile as Record<string, unknown> | null)?.weight_kg as number | null ?? null;

  // Pull posture and expression cues from last appearance session
  const appearanceResult = lastScan?.appearance_result as Record<string, unknown> | null;
  const postureCue = (appearanceResult?.postureCorrections as string[] | null)?.[0] ?? undefined;
  const expressionCue = (appearanceResult?.expressionTips as string[] | null)?.[0] ?? undefined;

  try {
    const admin = createAdminClient();

    // 1. Build script — shaped by their archetype, voice coaching, posture, expression, and body context
    const script = await buildScript(archetype, voiceFixes, goal, voiceStrengths, postureCue, expressionCue, heightCm, weightKg);
    console.log('[avatar/generate] script:', script);

    // 2. Get/upload talking photo (face personalization)
    const cachedPhotoIdPath = `${user.id}/heygen_photo_id_${rawPhotoPath.replace(/\//g, '_')}.txt`;
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
    console.log('[avatar/generate] talkingPhotoId from cache:', talkingPhotoId ?? 'none');

    if (!talkingPhotoId) {
      const { data: signedData, error: signErr } = await admin.storage
        .from('face-scans').createSignedUrl(rawPhotoPath, 600);
      if (signErr || !signedData?.signedUrl) {
        throw new Error('Could not access your face scan. Please redo your Face Scan and try again.');
      }

      const photoRes = await fetch(signedData.signedUrl);
      if (!photoRes.ok) throw new Error('Could not retrieve your face scan photo.');
      const photoBuffer = Buffer.from(await photoRes.arrayBuffer());
      const rawMime = photoRes.headers.get('content-type') || 'image/jpeg';
      const photoMime = rawMime.split(';')[0].trim() || 'image/jpeg';

      console.log('[avatar/generate] uploading photo, size:', photoBuffer.length, 'mime:', photoMime);

      const uploadRes = await fetch('https://upload.heygen.com/v1/talking_photo', {
        method: 'POST',
        headers: { 'X-Api-Key': HEYGEN, 'Content-Type': photoMime },
        body: photoBuffer,
      });
      const uploadText = await uploadRes.text();
      console.log('[avatar/generate] talking_photo upload:', uploadRes.status, uploadText.slice(0, 300));

      let uploadData: { code?: number; data?: { talking_photo_id?: string }; message?: string; error?: string } = {};
      try { uploadData = JSON.parse(uploadText); } catch {
        throw new Error(`Photo upload failed (${uploadRes.status}): ${uploadText.slice(0, 150)}`);
      }
      talkingPhotoId = uploadData.data?.talking_photo_id;

      if (talkingPhotoId) {
        await admin.storage.from('face-scans').upload(
          cachedPhotoIdPath,
          Buffer.from(talkingPhotoId),
          { contentType: 'text/plain', upsert: true }
        );
      } else {
        const heygenMsg = uploadData.message || uploadData.error || uploadText.slice(0, 200);
        const detail = uploadRes.status === 401 ? 'API authentication failed'
          : uploadRes.status === 429 ? 'Rate limit hit — try again in a minute'
          : heygenMsg || `HTTP ${uploadRes.status}`;
        throw new Error(
          `Photo upload failed: ${detail}. ` +
          'Try redoing your Face Scan with a clear, front-facing, well-lit photo (JPEG/PNG).'
        );
      }
    }

    // 3. Clone user's voice from their recording (best effort — falls back to preset)
    const cachedVoiceIdPath = audioPath
      ? `${user.id}/cloned_voice_id_${audioPath.replace(/\//g, '_')}.txt`
      : null;

    let clonedVoiceId: string | null = null;

    if (cachedVoiceIdPath && !forceUpload) {
      try {
        const { data: cachedVoice } = await admin.storage.from('face-scans').download(cachedVoiceIdPath);
        if (cachedVoice) {
          const id = (await cachedVoice.text()).trim();
          if (id) clonedVoiceId = id;
        }
      } catch { /* no cache */ }
    }

    if (!clonedVoiceId && audioPath) {
      clonedVoiceId = await cloneVoiceFromRecording(admin, user.id, audioPath);
      if (clonedVoiceId && cachedVoiceIdPath) {
        // Cache for reuse
        await admin.storage.from('face-scans').upload(
          cachedVoiceIdPath,
          Buffer.from(clonedVoiceId),
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
          voice: {
            type: 'text',
            input_text: script,
            voice_id: voiceId,
            speed: 1.0,
          },
          background: { type: 'color', value: '#0f172a' },
        }],
        dimension: { width: 720, height: 1280 },
        test: false,
      }),
    });

    const videoText = await videoRes.text();
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
