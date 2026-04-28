import { NextResponse } from 'next/server';
import { getAnthropic, firstText } from '@/lib/anthropic';
import { CONTEXT_EXTRACTOR_PROMPT } from '@/lib/claude/prompts';
import { extractJson } from '@/lib/json';
import type { ChatMessage, ExtractedContext } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function transcriptFromHistory(history: ChatMessage[]): string {
  return history
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');
}

export async function POST(req: Request) {
  try {
    const { history } = (await req.json()) as { history: ChatMessage[] };
    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json({ error: 'history is required' }, { status: 400 });
    }

    const transcript = transcriptFromHistory(history);
    const client = getAnthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: CONTEXT_EXTRACTOR_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Intake transcript:\n\n${transcript}\n\nProduce the structured context object.`,
        },
      ],
    });

    const text = firstText(response.content);
    const parsed = extractJson<ExtractedContext>(text);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
