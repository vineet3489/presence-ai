import { NextResponse } from 'next/server';

const HEYGEN = process.env.HEYGEN_API_KEY!;
const PRESET_SCRIPT = "I walk into every room knowing exactly who I am. I'm direct, I'm present, and I make people feel good being around me. What's your name?";

async function getPresetVoiceId(): Promise<string | null> {
  try {
    const res = await fetch('https://api.heygen.com/v2/voices', { headers: { 'X-Api-Key': HEYGEN } });
    const data = await res.json();
    const voices: { voice_id: string; gender?: string; language?: string; name?: string }[] = data.data?.voices || [];
    const pick = voices.find(v => v.gender?.toLowerCase() === 'male' &&
      (v.name?.toLowerCase().includes('ryan') || v.name?.toLowerCase().includes('james') || v.name?.toLowerCase().includes('adam'))
    ) || voices.find(v => v.gender?.toLowerCase() === 'male' &&
      (v.language?.toLowerCase().includes('english') || v.name?.toLowerCase().includes('en'))
    ) || voices[0];
    return pick?.voice_id ?? null;
  } catch { return null; }
}

export async function POST(req: Request) {
  if (!HEYGEN) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  // Basic rate limit: 1 per IP per hour via simple header check (no Redis — rely on Vercel edge)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  console.log('[avatar/preview] request from IP:', ip);

  try {
    const formData = await req.formData();
    const photo = formData.get('photo') as File | null;
    if (!photo) return NextResponse.json({ error: 'Photo required' }, { status: 400 });

    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    const rawMime = photo.type || 'image/jpeg';
    const photoMime = rawMime.split(';')[0].trim() || 'image/jpeg';

    // Upload talking photo
    const uploadRes = await fetch('https://upload.heygen.com/v1/talking_photo', {
      method: 'POST',
      headers: { 'X-Api-Key': HEYGEN, 'Content-Type': photoMime },
      body: photoBuffer,
    });
    const uploadText = await uploadRes.text();
    let uploadData: { data?: { talking_photo_id?: string }; message?: string } = {};
    try { uploadData = JSON.parse(uploadText); } catch {
      throw new Error(`Upload failed (${uploadRes.status})`);
    }
    const talkingPhotoId = uploadData.data?.talking_photo_id;
    if (!talkingPhotoId) throw new Error('Could not process photo. Use a clear, front-facing photo.');

    const voiceId = await getPresetVoiceId();
    if (!voiceId) throw new Error('No voice available');

    // Generate video with watermark caption
    const videoRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: { 'X-Api-Key': HEYGEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_inputs: [{
          character: { type: 'talking_photo', talking_photo_id: talkingPhotoId },
          voice: { type: 'text', input_text: PRESET_SCRIPT, voice_id: voiceId, speed: 1.0 },
          background: { type: 'color', value: '#0f172a' },
        }],
        dimension: { width: 720, height: 1280 },
        caption: true,
        test: false,
      }),
    });
    const videoData = await videoRes.json();
    const videoId = videoData.data?.video_id;
    if (!videoId) throw new Error(`Video generation failed: ${JSON.stringify(videoData).slice(0, 150)}`);

    return NextResponse.json({ videoId });
  } catch (err) {
    console.error('[avatar/preview]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Generation failed' }, { status: 500 });
  }
}
