import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const audio = formData.get('audio') as File | null;
  const sessionId = formData.get('sessionId') as string | null;

  if (!audio || !sessionId) {
    return NextResponse.json({ error: 'audio and sessionId required' }, { status: 400 });
  }

  const ext = audio.type.includes('mp4') ? 'mp4' : 'webm';
  const path = `${user.id}/voice_${sessionId}.${ext}`;
  const buffer = Buffer.from(await audio.arrayBuffer());

  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from('face-scans')
    .upload(path, buffer, { contentType: audio.type, upsert: true });

  if (uploadError) {
    console.error('[save-audio] upload:', uploadError);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  // Patch voice_result with the audio path so history can show it
  const { data: session } = await (admin as any)
    .from('analysis_sessions')
    .select('voice_result')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (session?.voice_result) {
    await (admin as any)
      .from('analysis_sessions')
      .update({ voice_result: { ...(session.voice_result as object), audioStoragePath: path } })
      .eq('id', sessionId);
  }

  return NextResponse.json({ path });
}
