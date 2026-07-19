import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not set' }, { status: 500 });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=200`
  );
  const data = await res.json();
  const models = (data.models || []) as {
    name: string;
    displayName?: string;
    supportedGenerationMethods?: string[];
    description?: string;
  }[];

  const imageCapable = models.filter(m =>
    m.name.toLowerCase().includes('image') ||
    m.description?.toLowerCase().includes('image generation') ||
    m.displayName?.toLowerCase().includes('image')
  );

  const generateContent = models.filter(m =>
    m.supportedGenerationMethods?.includes('generateContent')
  );

  return NextResponse.json({
    total: models.length,
    image_capable: imageCapable.map(m => ({ name: m.name, display: m.displayName, methods: m.supportedGenerationMethods })),
    generate_content_count: generateContent.length,
    all_names: models.map(m => m.name),
  });
}
