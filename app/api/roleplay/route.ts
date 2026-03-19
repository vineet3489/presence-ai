import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { ROLEPLAY_SYSTEM_PROMPT, buildRoleplayPrompt } from '@/lib/claude/prompts';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const RequestSchema = z.object({
  scenarioId: z.string().max(50),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(1500),
  })).max(40),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const { scenarioId, messages } = parsed.data;

  const scenarioContext = buildRoleplayPrompt(scenarioId);
  const systemPrompt = `${ROLEPLAY_SYSTEM_PROMPT}\n\nSCENARIO CONTEXT:\n${scenarioContext}`;

  const claudeMessages = messages.map((m) => {
    if (m.role === 'assistant') {
      const stripped = m.content.split('COACHING_JSON:')[0].trim();
      return { role: m.role as 'user' | 'assistant', content: stripped };
    }
    return { role: m.role as 'user' | 'assistant', content: m.content };
  });

  if (claudeMessages.length === 0) {
    claudeMessages.push({ role: 'user', content: '[Scene start — describe what you see and set the scene. Then tell me to make my move.]' });
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: systemPrompt,
    messages: claudeMessages,
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '';

  const jsonMatch = raw.match(/COACHING_JSON:\s*(\{[\s\S]*?\})/);
  let score = { confidence: 0, warmth: 0, naturalness: 0 };
  let coaching = '';

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      score = {
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
        warmth: Math.min(100, Math.max(0, Number(parsed.warmth) || 0)),
        naturalness: Math.min(100, Math.max(0, Number(parsed.naturalness) || 0)),
      };
      coaching = String(parsed.coaching ?? '').slice(0, 300);
    } catch {
      // keep defaults
    }
  }

  const reply = raw.split('COACHING_JSON:')[0].trim();
  return NextResponse.json({ reply, score, coaching, raw });
}
