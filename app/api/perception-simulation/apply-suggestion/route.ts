import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { beforeSimulationId, suggestionDetail } = body as {
    beforeSimulationId?: string;
    suggestionDetail?: Record<string, unknown>;
  };

  if (!beforeSimulationId) {
    return NextResponse.json({ error: 'beforeSimulationId is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('improvement_log')
    .insert({
      user_id: user.id,
      before_simulation_id: beforeSimulationId,
      suggestion_type: 'bio_rewrite',
      suggestion_detail: suggestionDetail ?? null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[apply-suggestion]', error);
    return NextResponse.json({ error: 'Failed to log suggestion' }, { status: 500 });
  }

  return NextResponse.json({ logId: data.id });
}
