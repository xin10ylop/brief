import { NextResponse } from 'next/server';
import { getAnthropic, firstText } from '@/lib/anthropic';
import { INTAKE_QUESTION_PROMPT } from '@/lib/claude/prompts';
import { extractJson } from '@/lib/json';
import type { ChatMessage, IntakeQuestion } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { history } = (await req.json()) as { history: ChatMessage[] };
    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json({ error: 'history is required' }, { status: 400 });
    }

    const client = getAnthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: INTAKE_QUESTION_PROMPT,
      messages: history,
    });

    const text = firstText(response.content);
    const parsed = extractJson<IntakeQuestion>(text);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
