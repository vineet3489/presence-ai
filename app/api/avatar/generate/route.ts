import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
// Note: photo is passed as a signed URL — no separate HeyGen upload needed

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const HEYGEN = process.env.HEYGEN_API_KEY!;

async function buildScript(archetype: string, voiceFixes: string[], goal: string): Promise<string> {
  const goalContext = goal?.includes('date') ? 'approaching a woman at a café or bar' : 'making a strong first impression in a social setting';
  const fixes = voiceFixes.length > 0 ? `Voice notes: ${voiceFixes.slice(0, 2).join('; ')}` : '';

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Write a 15-second spoken script (~38–42 words) for ${goalContext}.
The speaker's style archetype: "${archetype}".
${fixes}

Rules:
- Zero filler words (no um, like, basically, you know)
- Confident sentence endings — no upward questioning tone
- Observational opener, genuine curiosity, ends with a single question
- Matches the energy of the archetype
- Natural, not pickup-line cheesy
- First person, present tense
- Return ONLY the spoken words — no quotes, no stage directions, nothing else.`
    }]
  });
  return ((msg.content[0] as { text: string }).text).trim();
}

async function getPresetVoice(): Promise<string | null> {
  try {
    const res = await fetch('https://api.heygen.com/v2/voices', {
      headers: { 'X-Api-Key': HEYGEN },
    });
    const data = await res.json();
    const voices: { voice_id: string; language?: string; gender?: string; name?: string }[] =
      data.data?.voices || data.voices || [];
    // Prefer English male voice
    const pick = voices.find(v =>
      (v.language?.toLowerCase().includes('english') || v.name?.toLowerCase().includes('english'))
      && v.gender?.toLowerCase() === 'male'
    ) || voices.find(v =>
      v.language?.toLowerCase().includes('english') || v.name?.toLowerCase().includes('en')
    ) || voices[0];
    return pick?.voice_id ?? null;
  } catch {
    return null;
  }
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!HEYGEN) return NextResponse.json({ error: 'HeyGen not configured' }, { status: 500 });

  // Fetch all required data in parallel
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
      .like('date_prep_result->>type', 'style_profile%')
      .order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('user_profiles').select('goals').eq('user_id', user.id).single(),
  ]);

  const photoPath = (lastScan?.appearance_result as Record<string, unknown>)?.photoStoragePath as string | null;
  if (!photoPath) {
    return NextResponse.json({
      error: 'no_photo',
      message: 'Do a Face Scan first — we need your photo to build the avatar.',
    }, { status: 400 });
  }

  const archetype = ((styleSession?.date_prep_result as Record<string, unknown>)?.data as Record<string, unknown>)?.archetype as string
    || (lastScan?.appearance_result as Record<string, unknown>)?.faceShape as string
    || 'The Sharp Minimalist';
  const voiceFixes: string[] = ((voiceSession?.voice_result as Record<string, unknown>)?.improvementsList as string[]) || [];
  const goal: string = (profile?.goals as string[])?.[0] || '';

  try {
    // 1. Generate script
    const script = await buildScript(archetype, voiceFixes, goal);

    // 2. Get a signed URL for the face photo (HeyGen fetches it directly — no upload step needed)
    const admin = createAdminClient();
    const { data: signedData, error: signErr } = await admin.storage
      .from('face-scans')
      .createSignedUrl(photoPath, 600); // 10-min window for HeyGen to fetch
    if (signErr || !signedData?.signedUrl) throw new Error('Could not access face photo. Try re-scanning.');
    const photoUrl = signedData.signedUrl;

    // 3. Pick a voice
    const voiceId = await getPresetVoice();
    if (!voiceId) throw new Error('No voice available from HeyGen');

    // 4. Generate the video — pass photo URL directly as talking_photo_url
    const videoRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: { 'X-Api-Key': HEYGEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'talking_photo',
            talking_photo_url: photoUrl,
            scale: 1.0,
            talking_style: 'stable',
          },
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
    const videoData = await videoRes.json();
    const videoId: string | undefined = videoData.data?.video_id;
    if (!videoId) throw new Error(`Video generation failed: ${JSON.stringify(videoData)}`);

    return NextResponse.json({ videoId, script });
  } catch (err) {
    console.error('[avatar/generate]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Avatar generation failed' },
      { status: 500 }
    );
  }
}
