import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

  // Fetch user profile for age + face scan data for face shape/skin tone
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
  const age = profile?.age || null;

  const outfit = styleProfile.signatureOutfits?.[0]?.outfit || '';
  const colors = [...(styleProfile.colorPalette.primary || []), ...(styleProfile.colorPalette.accent || [])].slice(0, 4).join(', ');

  const prompt = buildImagePrompt({ archetype: styleProfile.archetype, outfit, colors, faceShape, skinTone, age });

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Google AI not configured' }, { status: 500 });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as any,
    });

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return NextResponse.json({
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
          prompt,
        });
      }
    }

    return NextResponse.json({ error: 'No image generated' }, { status: 500 });
  } catch (err: unknown) {
    console.error('Image generation error:', err);
    const message = err instanceof Error ? err.message : 'Image generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildImagePrompt(data: {
  archetype: string;
  outfit: string;
  colors: string;
  faceShape: string | null;
  skinTone: string | null;
  age: number | null;
}): string {
  const ageDesc = data.age ? `${data.age}-year-old ` : '';
  const faceDesc = data.faceShape ? `, ${data.faceShape} face shape` : '';
  const skinDesc = data.skinTone ? `, ${data.skinTone} skin tone` : '';

  return `Fashion editorial photograph of a ${ageDesc}person${faceDesc}${skinDesc}, embodying the "${data.archetype}" aesthetic. Wearing: ${data.outfit}. Color palette: ${data.colors}. Studio lighting, sharp focus, clean neutral background, high-quality fashion photography, confident relaxed posture, looking slightly away from camera. Photorealistic, not illustrated.`;
}
