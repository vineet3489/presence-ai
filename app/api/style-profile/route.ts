import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are PresenceAI's style archetype consultant — part personal stylist, part psychologist. You generate sharp, specific, personalized style profiles that feel like they were written by someone who actually knows the person.

DO NOT be generic. Use the data to infer specifics. If they're 24, in Mumbai, work in tech — that informs the wardrobe, the scene, the vibe.

Respond with a valid JSON object:
{
  "archetype": "string (2-3 word archetype name, e.g. 'The Urban Professional', 'The Effortless Minimalist', 'The Confident Disruptor')",
  "archetypeDescription": "string (2-3 sentences — who this person is, what energy they bring, what makes them magnetic. Speak directly to them.)",
  "colorPalette": {
    "primary": ["string (exact color, e.g. 'slate grey')", "string", "string"],
    "accent": ["string", "string"],
    "avoid": ["string (color to avoid and why)"]
  },
  "signatureOutfits": [
    {
      "occasion": "string (e.g. 'Casual day out', 'Work / professional', 'Evening / date')",
      "outfit": "string (specific head-to-toe description)",
      "why": "string (1 sentence on why this works for their archetype)"
    }
  ],
  "hairAdvice": "string (1-2 sentences — specific style direction that suits their archetype and face shape context)",
  "grooming": "string (1-2 sentences — specific grooming priorities for their archetype)",
  "presenceTip": "string (one non-obvious presence tip that goes beyond just clothes — posture, eye contact, energy management — specific to who they are)",
  "whatToAvoid": ["string (specific thing to stop doing or wearing)", "string", "string"]
}

Generate exactly 3 signatureOutfits.`;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  // Check if we have a cached style profile (regenerate weekly)
  const { data: cached } = await supabase
    .from('analysis_sessions')
    .select('date_prep_result, created_at')
    .eq('user_id', user.id)
    .eq('session_type', 'date_prep')
    .like('date_prep_result->>type', 'style_profile%')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (cached?.date_prep_result && cached.created_at) {
    const age = Date.now() - new Date(cached.created_at).getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (age < weekMs) {
      return NextResponse.json({ profile: (cached.date_prep_result as any).data });
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

  // Cache in analysis_sessions using a spare column
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
  const education = profile.education as string | null;
  const bigFive = profile.big_five as Record<string, number> | null;

  const extraversion = bigFive?.extraversion ?? 3;
  const openness = bigFive?.openness ?? 3;
  const neuroticism = bigFive?.neuroticism ?? 3;

  const personalityNote =
    extraversion >= 4 ? 'naturally extroverted and socially confident' :
    extraversion <= 2 ? 'introverted and selectively social' :
    'ambiverted — comfortable in both settings';

  return `Generate a personalized style profile for this person:

STYLE DIRECTION: ${style}
GOALS: ${goals}
${age ? `AGE: ${age}` : ''}
${city ? `CITY/LOCATION: ${city}` : ''}
${occupation ? `OCCUPATION: ${occupation}` : ''}
${education ? `EDUCATION: ${education}` : ''}

PERSONALITY:
- Openness to style experimentation: ${openness}/5
- Social energy: ${personalityNote}
- Confidence baseline: ${neuroticism <= 2 ? 'naturally confident' : neuroticism >= 4 ? 'working on confidence' : 'context-dependent'}

Give them a specific archetype, a color palette that actually suits their context, 3 outfit blueprints for different occasions, and sharp advice on what makes them uniquely magnetic. Make them feel like you actually know them.`;
}
