import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { callClaudeWithImage } from '@/lib/claude/client';
import { APPEARANCE_SYSTEM_PROMPT, buildAppearancePrompt } from '@/lib/claude/prompts';
import { scoreAppearance } from '@/lib/scoring/presenceScore';
import type { AppearanceResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { imageBase64, mediaType = 'image/jpeg', objective } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Fetch user profile for personalization (only what the prompt needs)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const prompt = buildAppearancePrompt(profile, objective ?? null);
    const raw = await callClaudeWithImage(
      APPEARANCE_SYSTEM_PROMPT,
      prompt,
      imageBase64,
      mediaType,
      2000
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse Claude response');
    const result: AppearanceResult = JSON.parse(jsonMatch[0]);
    const score = scoreAppearance(result);

    const photoBuffer = Buffer.from(imageBase64, 'base64');
    const admin = createAdminClient();

    // DB save and photo upload run in parallel — both needed before we can update the session
    const [{ data: session, error: dbError }, uploadResult] = await Promise.all([
      supabase
        .from('analysis_sessions')
        .insert({ user_id: user.id, session_type: 'appearance', appearance_result: result, appearance_score: score })
        .select('id')
        .single(),
      (async () => {
        // We don't know session.id yet, use a temp path; renamed below
        try {
          // Upload to a temp path — will be renamed once session.id is known
          const tmpPath = `${user.id}/tmp_${Date.now()}.jpg`;
          const { error } = await admin.storage.from('face-scans').upload(tmpPath, photoBuffer, { contentType: mediaType, upsert: true });
          return error ? null : tmpPath;
        } catch { return null; }
      })(),
    ]);

    if (dbError) console.error('DB save error:', dbError);

    // Fire-and-forget: rename temp file to canonical path and update session record
    if (session?.id && uploadResult) {
      const photoPath = `${user.id}/${session.id}.jpg`;
      Promise.all([
        admin.storage.from('face-scans').move(uploadResult, photoPath),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any).from('analysis_sessions')
          .update({ appearance_result: { ...result, photoStoragePath: photoPath } })
          .eq('id', session.id),
      ]).catch(e => console.error('Photo finalize error (non-fatal):', e));
    }

    return NextResponse.json({ result, score, sessionId: session?.id });
  } catch (err) {
    console.error('[analyze-appearance]', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
