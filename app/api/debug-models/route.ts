import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No GOOGLE_AI_API_KEY set' });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`
  );
  const data = await res.json();

  // Filter to models that support generateContent or predict
  const imageModels = (data.models ?? []).filter((m: any) =>
    m.name?.toLowerCase().includes('imagen') ||
    m.name?.toLowerCase().includes('image') ||
    m.supportedGenerationMethods?.includes('predict') ||
    m.description?.toLowerCase().includes('image')
  );

  return NextResponse.json({
    imageCapableModels: imageModels.map((m: any) => ({
      name: m.name,
      methods: m.supportedGenerationMethods,
      description: m.description?.slice(0, 80),
    })),
    allModelNames: (data.models ?? []).map((m: any) => m.name),
  });
}
