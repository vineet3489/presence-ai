import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const ZODIAC_SIGNS = [
  { sign: 'Capricorn', emoji: '♑', start: [12, 22], end: [1, 19] },
  { sign: 'Aquarius',  emoji: '♒', start: [1, 20],  end: [2, 18] },
  { sign: 'Pisces',    emoji: '♓', start: [2, 19],  end: [3, 20] },
  { sign: 'Aries',     emoji: '♈', start: [3, 21],  end: [4, 19] },
  { sign: 'Taurus',    emoji: '♉', start: [4, 20],  end: [5, 20] },
  { sign: 'Gemini',    emoji: '♊', start: [5, 21],  end: [6, 20] },
  { sign: 'Cancer',    emoji: '♋', start: [6, 21],  end: [7, 22] },
  { sign: 'Leo',       emoji: '♌', start: [7, 23],  end: [8, 22] },
  { sign: 'Virgo',     emoji: '♍', start: [8, 23],  end: [9, 22] },
  { sign: 'Libra',     emoji: '♎', start: [9, 23],  end: [10, 22] },
  { sign: 'Scorpio',   emoji: '♏', start: [10, 23], end: [11, 21] },
  { sign: 'Sagittarius', emoji: '♐', start: [11, 22], end: [12, 21] },
];

function getZodiac(dob: string): { sign: string; emoji: string } {
  const date = new Date(dob);
  const m = date.getMonth() + 1;
  const d = date.getDate();

  for (const z of ZODIAC_SIGNS) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm <= em) {
      if ((m === sm && d >= sd) || (m === em && d <= ed) || (m > sm && m < em)) {
        return { sign: z.sign, emoji: z.emoji };
      }
    } else {
      // Wraps year (Capricorn: Dec 22 – Jan 19)
      if ((m === sm && d >= sd) || (m === em && d <= ed)) {
        return { sign: z.sign, emoji: z.emoji };
      }
    }
  }
  return { sign: 'Capricorn', emoji: '♑' };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('date_of_birth, place_of_birth, goals, age, city, big_five')
    .eq('user_id', user.id)
    .single();

  const dob = (profile as Record<string, unknown> | null)?.date_of_birth as string | null;
  if (!dob) return NextResponse.json({ zodiac: null, noDob: true });

  const zodiac = getZodiac(dob);

  // Check cache in analysis_sessions (30 days)
  const { data: recentSessions } = await supabase
    .from('analysis_sessions')
    .select('date_prep_result, created_at')
    .eq('user_id', user.id)
    .eq('session_type', 'date_prep')
    .order('created_at', { ascending: false })
    .limit(10);

  const cached = recentSessions?.find(s => {
    const type = (s.date_prep_result as Record<string, unknown> | null)?.type;
    return typeof type === 'string' && type === 'zodiac_v1' &&
      (s.date_prep_result as Record<string, unknown>)?.sign === zodiac.sign;
  });

  if (cached?.date_prep_result && cached.created_at) {
    const ageMs = Date.now() - new Date(cached.created_at).getTime();
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    if (ageMs < monthMs) {
      return NextResponse.json({
        zodiac: zodiac.sign,
        emoji: zodiac.emoji,
        insights: (cached.date_prep_result as Record<string, unknown>).insights,
      });
    }
  }

  const goals = (profile?.goals as string[] | null)?.join(', ') || 'build confidence';
  const city = (profile as Record<string, unknown> | null)?.city as string | null || profile?.city;
  const placeOfBirth = (profile as Record<string, unknown> | null)?.place_of_birth as string | null;

  const prompt = `Generate concise zodiac-based personality insights for a ${zodiac.sign} (${zodiac.emoji}) man.
Context: Goals — ${goals}. ${city ? `Based in ${city}.` : ''} ${placeOfBirth ? `Born in ${placeOfBirth}.` : ''}

Respond with a valid JSON object:
{
  "tagline": "string (5-7 words that define this sign's social energy, e.g. 'The one people remember for years')",
  "coreTraits": ["string (3-4 word trait)", "string", "string"],
  "socialStrength": "string (1 sentence — what this sign naturally pulls off in social situations)",
  "blindSpot": "string (1 sentence — the one thing this sign tends to do that undercuts their magnetism)",
  "dailyPresenceTip": "string (1-2 sentences — a specific, actionable tip rooted in this sign's energy. Not generic.)",
  "phraseToOwn": "string (a short phrase or sentence that feels authentic to this sign's voice — something they can say today)"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';
  let insights: Record<string, unknown>;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    insights = JSON.parse(match ? match[0] : raw);
  } catch {
    return NextResponse.json({ error: 'Failed to parse zodiac insights' }, { status: 500 });
  }

  // Cache
  await supabase.from('analysis_sessions').insert({
    user_id: user.id,
    session_type: 'date_prep',
    date_prep_result: { type: 'zodiac_v1', sign: zodiac.sign, insights },
  });

  return NextResponse.json({ zodiac: zodiac.sign, emoji: zodiac.emoji, insights });
}
