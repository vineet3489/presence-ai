import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export interface CoachingMemory {
  patterns?: Record<string, string>;
  history?: Array<{ date: string; type: string; score: number; key_insight: string }>;
  coach_observations?: string[];
}

function buildMemoryContext(memory?: CoachingMemory | null): string {
  if (!memory) return '';
  const obs = memory.coach_observations?.filter(Boolean) ?? [];
  const patterns = memory.patterns ?? {};
  const hasContent = obs.length > 0 || Object.keys(patterns).length > 0;
  if (!hasContent) return '';
  return `\n\nCOACHING HISTORY FOR THIS USER:\nObservations: ${obs.join('; ')}\nPatterns: ${JSON.stringify(patterns)}`;
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 1500,
  memory?: CoachingMemory | null
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: systemPrompt + buildMemoryContext(memory),
    messages: [{ role: 'user', content: userMessage }],
  });
  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');
  return content.text;
}

export async function callClaudeWithImage(
  systemPrompt: string,
  userMessage: string,
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  maxTokens = 2000,
  memory?: CoachingMemory | null
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: systemPrompt + buildMemoryContext(memory),
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: userMessage },
      ],
    }],
  });
  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');
  return content.text;
}
