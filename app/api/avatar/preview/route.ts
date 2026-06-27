import { NextResponse } from 'next/server';

const HEYGEN = process.env.HEYGEN_API_KEY!;
const PRESET_SCRIPT = "I walk into every room knowing exactly who I am. I'm direct, I'm present, and I make people feel good being around me. What's your name?";
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

async function getPresetVoiceId(): Promise<string | null> {
  try {
    const res = await fetch('https://api.heygen.com/v2/voices', {
      headers: { 'X-Api-Key': HEYGEN },
    });
    const data = await res.json();
    const voices: { voice_id: string; gender?: string; language?: string; name?: string }[] =
      data.data?.voices || data.voices || [];
    const pick =
      voices.find(v => v.gender?.toLowerCase() === 'male' && (
        v.name?.toLowerCase().includes('ryan') ||
        v.name?.toLowerCase().includes('james') ||
        v.name?.toLowerCase().includes('adam')
      )) ||
      voices.find(v => v.gender?.toLowerCase() === 'male' && (
        v.language?.toLowerCase().includes('english') || v.name?.toLowerCase().includes('en')
      )) ||
      voices.find(v => v.gender?.toLowerCase() === 'male') ||
      voices[0];
    return pick?.voice_id ?? null;
  } catch { return null; }
}

export async function POST(req: Request) {
  if (!HEYGEN) {
    return NextResponse.json({ error: 'Avatar generation not configured' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const photo = formData.get('photo') as File | null;
    if (!photo) return NextResponse.json({ error: 'Photo required' }, { status: 400 });

    // Validate file size
    if (photo.size > MAX_SIZE_BYTES) {
      return NextResponse.json({
        error: `Photo too large (${Math.round(photo.size / 1024 / 1024)}MB). Please use a photo under 8MB.`
      }, { status: 400 });
    }

    // Validate MIME type — HeyGen only accepts JPEG and PNG
    const rawMime = (photo.type || '').split(';')[0].trim().toLowerCase();
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (rawMime && !supportedTypes.includes(rawMime)) {
      return NextResponse.json({
        error: `Photo format "${rawMime}" not supported. Please use a JPEG or PNG photo.`
      }, { status: 400 });
    }
    const photoMime = rawMime || 'image/jpeg';

    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    console.log('[avatar/preview] uploading photo — size:', photoBuffer.length, 'mime:', photoMime);

    // Upload talking photo
    const uploadRes = await fetch('https://upload.heygen.com/v1/talking_photo', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN,
        'Content-Type': photoMime,
      },
      body: photoBuffer,
    });

    const uploadText = await uploadRes.text();
    console.log('[avatar/preview] talking_photo response:', uploadRes.status, uploadText.slice(0, 300));

    let uploadData: { code?: number; data?: { talking_photo_id?: string }; message?: string; error?: string } = {};
    try { uploadData = JSON.parse(uploadText); } catch { /* raw text */ }

    const talkingPhotoId = uploadData.data?.talking_photo_id;

    if (!talkingPhotoId) {
      // Return the actual HeyGen error so we know what's wrong
      const heygenMsg = uploadData.message || uploadData.error || uploadText.slice(0, 200);
      const userMsg = uploadRes.status === 401 || uploadRes.status === 403
        ? 'API authentication failed. Contact support.'
        : uploadRes.status === 429
        ? 'Too many requests. Please try again in a minute.'
        : heygenMsg?.toLowerCase().includes('face')
        ? 'No face detected. Use a clear, front-facing photo with good lighting.'
        : heygenMsg?.toLowerCase().includes('size') || heygenMsg?.toLowerCase().includes('large')
        ? 'Photo is too large. Try a smaller file.'
        : `Photo upload failed: ${heygenMsg || `HTTP ${uploadRes.status}`}`;

      return NextResponse.json({ error: userMsg }, { status: 400 });
    }

    const voiceId = await getPresetVoiceId();
    if (!voiceId) return NextResponse.json({ error: 'No voice available. Try again.' }, { status: 500 });

    // Generate video
    const videoBody = {
      video_inputs: [{
        character: { type: 'talking_photo', talking_photo_id: talkingPhotoId },
        voice: {
          type: 'text',
          input_text: PRESET_SCRIPT,
          voice_id: voiceId,
          speed: 1.0,
        },
        background: { type: 'color', value: '#0f172a' },
      }],
      dimension: { width: 720, height: 1280 },
      test: false,
    };

    const videoRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: { 'X-Api-Key': HEYGEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(videoBody),
    });
    const videoText = await videoRes.text();
    console.log('[avatar/preview] video/generate response:', videoRes.status, videoText.slice(0, 300));

    let videoData: { data?: { video_id?: string }; error?: { message?: string }; message?: string } = {};
    try { videoData = JSON.parse(videoText); } catch { /* raw */ }

    const videoId = videoData.data?.video_id;
    if (!videoId) {
      const errMsg = videoData.error?.message || videoData.message || videoText.slice(0, 150);
      throw new Error(`Video generation failed: ${errMsg}`);
    }

    return NextResponse.json({ videoId });

  } catch (err) {
    console.error('[avatar/preview]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
