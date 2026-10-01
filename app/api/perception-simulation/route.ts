import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { callClaudeWithImage } from '@/lib/claude/client';
import { PERCEPTION_SIMULATION_SYSTEM_PROMPT, buildPerceptionSimulationPrompt } from '@/lib/claude/prompts';
import { getPersonaById } from '@/lib/personas';
import { hasActiveAccess } from '@/lib/subscription';
import type { PerceptionSimulationResult, ProfileOptimizerResult, UserProfile } from '@/types';

const FREE_DAILY_LIMIT = 2;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    const profile = profileData as UserProfile | null;

    // Free-tier gate: unlimited for active trial/subscription, else capped per day
    const isSubscribed = hasActiveAccess(profile);
    const today = new Date().toISOString().split('T')[0];

    if (!isSubscribed) {
      const isNewDay = profile?.sim_count_date !== today;
      const countSoFar = isNewDay ? 0 : (profile?.sim_count_today ?? 0);

      if (countSoFar >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          { error: 'limit_reached', limit: FREE_DAILY_LIMIT },
          { status: 403 }
        );
      }

      await supabase
        .from('user_profiles')
        .update({ sim_count_today: countSoFar + 1, sim_count_date: today })
        .eq('user_id', user.id);
    }

    const body = await request.json();
    const { photoBase64, mediaType = 'image/jpeg', bioText, personaId, parentSimulationId } = body as {
      photoBase64?: string;
      mediaType?: 'image/jpeg' | 'image/png';
      bioText?: string;
      personaId?: string;
      parentSimulationId?: string;
    };

    if (!photoBase64) return NextResponse.json({ error: 'Photo is required' }, { status: 400 });
    if (!personaId) return NextResponse.json({ error: 'Persona is required' }, { status: 400 });

    const persona = getPersonaById(personaId);
    if (!persona) return NextResponse.json({ error: 'Unknown persona' }, { status: 400 });

    const memory = (profile as unknown as Record<string, unknown> | null)?.coaching_memory ?? null;
    const prompt = buildPerceptionSimulationPrompt(profile, persona, bioText ?? '');
    const raw = await callClaudeWithImage(
      PERCEPTION_SIMULATION_SYSTEM_PROMPT,
      prompt,
      photoBase64,
      mediaType,
      2500,
      memory as import('@/lib/claude/client').CoachingMemory
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse Claude response');
    const parsed = JSON.parse(jsonMatch[0]) as {
      simulation: Omit<PerceptionSimulationResult, 'personaId'>;
      optimizer: ProfileOptimizerResult;
    };

    const simulation: PerceptionSimulationResult = { ...parsed.simulation, personaId };
    const optimizer = parsed.optimizer;

    const photoBuffer = Buffer.from(photoBase64, 'base64');
    const admin = createAdminClient();

    const [{ data: session, error: dbError }, uploadResult] = await Promise.all([
      supabase
        .from('simulation_results')
        .insert({
          user_id: user.id,
          persona_id: personaId,
          bio_text: bioText ?? null,
          swipe_probability: simulation.swipeProbability,
          reply_probability: simulation.replyProbability,
          profile_strength_score: simulation.profileStrengthScore,
          tags: simulation.tags,
          narrative: simulation.narrative,
          optimizer_result: optimizer,
          parent_simulation_id: parentSimulationId ?? null,
        })
        .select('id')
        .single(),
      (async () => {
        try {
          const tmpPath = `${user.id}/tmp_perception_${Date.now()}.jpg`;
          const { error } = await admin.storage.from('face-scans').upload(tmpPath, photoBuffer, { contentType: mediaType, upsert: true });
          return error ? null : tmpPath;
        } catch { return null; }
      })(),
    ]);

    if (dbError) console.error('[perception-simulation] DB save error:', dbError);

    if (session?.id && uploadResult) {
      const photoPath = `${user.id}/perception_${session.id}.jpg`;
      try {
        await Promise.all([
          admin.storage.from('face-scans').move(uploadResult, photoPath),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (admin as any).from('simulation_results').update({ photo_storage_path: photoPath }).eq('id', session.id),
        ]);
      } catch (e) {
        console.error('[perception-simulation] Photo rename error:', e);
      }
    }

    return NextResponse.json({ simulation, optimizer, sessionId: session?.id });
  } catch (err) {
    console.error('[perception-simulation]', err);
    return NextResponse.json({ error: 'Simulation failed. Please try again.' }, { status: 500 });
  }
}
