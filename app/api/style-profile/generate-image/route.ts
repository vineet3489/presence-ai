import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { styleProfile } = body as {
    styleProfile: {
      archetype: string;
      colorPalette: { primary: string[]; accent: string[] };
      signatureOutfits: { occasion: string; outfit: string }[];
    };
  };

  if (!styleProfile?.archetype) {
    return NextResponse.json({ error: 'Style profile required' }, { status: 400 });
  }

  const [{ data: profile }, { data: lastScan }] = await Promise.all([
    supabase.from('user_profiles').select('age, style_preference').eq('user_id', user.id).single(),
    supabase
      .from('analysis_sessions')
      .select('appearance_result')
      .eq('session_type', 'appearance')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  const faceShape = (lastScan?.appearance_result as any)?.faceShape || null;
  const skinTone = (lastScan?.appearance_result as any)?.skinTone || null;

  if (!faceShape || !skinTone) {
    return NextResponse.json(
      { error: 'no_scan', message: 'Complete a Face Scan first so we can generate a look that\'s actually based on you.' },
      { status: 400 }
    );
  }

  const age = profile?.age || null;
  const outfit = styleProfile.signatureOutfits?.[0]?.outfit || '';
  const colors = [...(styleProfile.colorPalette.primary || []), ...(styleProfile.colorPalette.accent || [])].slice(0, 4).join(', ');
  const prompt = buildImagePrompt({ archetype: styleProfile.archetype, outfit, colors, faceShape, skinTone, age });

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Google AI not configured' }, { status: 500 });

  // Gemini 2.0 Flash image generation via AI Studio REST API
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('Gemini image API error:', res.status, errText);
    let detail = errText;
    try { detail = JSON.parse(errText)?.error?.message || errText; } catch {}
    return NextResponse.json({ error: detail }, { status: res.status });
  }

  const data = await res.json();

  // Find the image part in the response
  for (const candidate of data.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.inlineData?.data) {
        return NextResponse.json({
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        });
      }
    }
  }

  console.error('No image in Gemini response:', JSON.stringify(data));
  return NextResponse.json({ error: 'No image returned. ' + JSON.stringify(data) }, { status: 500 });
}

function buildImagePrompt(data: {
  archetype: string;
  outfit: string;
  colors: string;
  faceShape: string;
  skinTone: string;
  age: number | null;
}): string {
  const ageDesc = data.age ? `${data.age}-year-old ` : '';
  return `Fashion editorial photograph of a ${ageDesc}South Asian person with ${data.faceShape} face shape and ${data.skinTone} skin tone, embodying the "${data.archetype}" aesthetic. Wearing: ${data.outfit}. Color palette: ${data.colors}. Studio lighting, sharp focus, clean neutral background, confident relaxed posture, high-quality fashion photography, photorealistic.`;
}
