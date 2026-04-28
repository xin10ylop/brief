import { NextResponse } from 'next/server';
import { getAnthropic, firstText } from '@/lib/anthropic';
import { RECOMMENDATION_PROMPT } from '@/lib/claude/prompts';
import { extractJson } from '@/lib/json';
import type { ExtractedContext, RecommendationOutput } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { context } = (await req.json()) as { context: ExtractedContext };
    if (!context || !context.business_summary) {
      return NextResponse.json({ error: 'context is required' }, { status: 400 });
    }

    const client = getAnthropic();
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8000,
      system: RECOMMENDATION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Business context:\n\n${JSON.stringify(context, null, 2)}\n\nProduce the productivity proposal.`,
        },
      ],
    });

    const text = firstText(response.content);
    const parsed = extractJson<RecommendationOutput>(text);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
