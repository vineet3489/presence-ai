import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { consent_type } = await req.json() as { consent_type: string };
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  const now = new Date().toISOString();

  await Promise.all([
    supabase.from('user_consent_log').insert({
      user_id: user.id,
      consent_type,
      consented_at: now,
      ip_address: ip,
      user_agent: ua,
    }),
    supabase.from('user_profiles').update({ biometric_consent_at: now }).eq('user_id', user.id),
  ]);

  return NextResponse.json({ ok: true });
}
