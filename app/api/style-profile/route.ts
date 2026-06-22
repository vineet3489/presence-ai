import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are PresenceAI's style archetype consultant. Generate sharp, specific, personalized style profiles. Be direct, use their name if given. Start with a genuine compliment about what's already working, then give clear direction.

DO NOT be generic. Use their age, city, goals to infer specifics.

Respond with a valid JSON object:
{
  "archetype": "string (2-3 word archetype, e.g. 'The Sharp Minimalist')",
  "archetypeDescription": "string (1 sentence — who this person is and what makes them magnetic. Start with a compliment.)",
  "colorPalette": {
    "primary": ["string (exact color)", "string", "string"],
    "accent": ["string", "string"],
    "avoid": ["string (color + one-word reason)"]
  },
  "signatureOutfits": [
    {
      "occasion": "string (e.g. 'Casual', 'Work')",
      "outfit": "string (specific 1-sentence outfit — pieces + colors only, no explanation)"
    }
  ],
  "hairAdvice": "string (1 sentence — exact hairstyle name + why)",
  "grooming": "string (1-2 sentences — key grooming priorities for their age and context)"
}

Generate exactly 2 signatureOutfits (Casual + Work).`;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const forceRefresh = new URL(request.url).searchParams.get('refresh') === '1';

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  // Check for a cached style profile (weekly, unless force-refreshed)
  if (!forceRefresh) {
    const { data: recentSessions } = await supabase
      .from('analysis_sessions')
      .select('date_prep_result, created_at')
      .eq('user_id', user.id)
      .eq('session_type', 'date_prep')
      .order('created_at', { ascending: false })
      .limit(10);

    const cached = recentSessions?.find(s => {
      const type = (s.date_prep_result as Record<string, unknown> | null)?.type;
      return typeof type === 'string' && type.startsWith('style_profile');
    });

    if (cached?.date_prep_result && cached.created_at) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      if (age < weekMs) {
        return NextResponse.json({ profile: (cached.date_prep_result as Record<string, unknown>).data });
      }
    }
  }

  const prompt = buildPrompt(profile);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';

  let styleProfile: Record<string, unknown>;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    styleProfile = JSON.parse(match ? match[0] : raw);
  } catch {
    return NextResponse.json({ error: 'Failed to parse style profile' }, { status: 500 });
  }

  // Cache in analysis_sessions
  await supabase.from('analysis_sessions').insert({
    user_id: user.id,
    session_type: 'date_prep',
    date_prep_result: { type: 'style_profile_v1', data: styleProfile },
  });

  return NextResponse.json({ profile: styleProfile });
}

function buildPrompt(profile: Record<string, unknown>): string {
  const style = (profile.style_preference as string) || 'smart-casual';
  const goals = (profile.goals as string[] | null)?.join(', ') || 'look and feel more confident';
  const age = profile.age as number | null;
  const city = profile.city as string | null;
  const occupation = profile.occupation as string | null;
  const bigFive = profile.big_five as Record<string, number> | null;

  const extraversion = bigFive?.extraversion ?? 3;
  const openness = bigFive?.openness ?? 3;
  const neuroticism = bigFive?.neuroticism ?? 3;

  const personalityNote =
    extraversion >= 4 ? 'naturally extroverted and socially confident' :
    extraversion <= 2 ? 'introverted and selectively social' :
    'ambiverted — comfortable in both settings';

  // Age-specific grooming priorities
  const ageNote = age && age >= 35
    ? `IMPORTANT — they are ${age} years old: At this age oral hygiene (whitening, breath), skin care routine, subtle fragrance, and nail care are as important as style choices. Factor these prominently into grooming advice.`
    : age && age >= 28
    ? `They are ${age} — grooming should move beyond basics to include a consistent skin routine and signature scent.`
    : '';

  return `Generate a personalized style profile for this person:

STYLE DIRECTION: ${style}
GOALS: ${goals}
${age ? `AGE: ${age}` : ''}
${city ? `CITY/LOCATION: ${city}` : ''}
${occupation ? `OCCUPATION: ${occupation}` : ''}
${ageNote ? `\n${ageNote}` : ''}

PERSONALITY:
- Openness to style experimentation: ${openness}/5
- Social energy: ${personalityNote}
- Confidence baseline: ${neuroticism <= 2 ? 'naturally confident' : neuroticism >= 4 ? 'working on confidence' : 'context-dependent'}

Give them a specific archetype, a color palette that suits their context, 2 outfit blueprints for different occasions (Casual + Work), and sharp advice on grooming. Make it feel like you actually know them.`;
}
