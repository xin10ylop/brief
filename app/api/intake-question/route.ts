import { NextResponse } from 'next/server';
import { getAnthropic, firstText } from '@/lib/anthropic';
import { INTAKE_QUESTION_PROMPT } from '@/lib/claude/prompts';
import { extractJson } from '@/lib/json';
import type { ChatMessage, IntakeQuestionResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RequestBody = {
  history: ChatMessage[];
  selected_areas: string[];
  explored_areas: string[];
  current_area: string | null;
  phase: 'area_question' | 'catch_all';
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { history, selected_areas, explored_areas, current_area, phase } = body;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json({ error: 'history is required' }, { status: 400 });
    }
    if (!Array.isArray(selected_areas)) {
      return NextResponse.json({ error: 'selected_areas is required' }, { status: 400 });
    }

    const directive =
      phase === 'catch_all'
        ? 'PHASE: catch_all. All selected areas have been covered. Generate the final open-text catch-all question now.'
        : `PHASE: area_question. The area to explore in this turn is: "${current_area}". Generate one focused question about how that specific workflow currently works in the user's business. Reference the area name in your context_acknowledgment or question_text so the user knows which area you are exploring. Do not ask about any other area.`;

    const orchestration = [
      `SELECTED AREAS (in user-chosen order): ${selected_areas.join(' | ')}`,
      `AREAS ALREADY EXPLORED: ${explored_areas.length > 0 ? explored_areas.join(' | ') : 'none'}`,
      `CURRENT AREA: ${current_area ?? '(catch-all phase)'}`,
      directive,
    ].join('\n');

    const messages: ChatMessage[] = [
      ...history,
      { role: 'user', content: `[ORCHESTRATOR INSTRUCTIONS]\n${orchestration}` },
    ];

    const client = getAnthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: INTAKE_QUESTION_PROMPT,
      messages,
    });

    const text = firstText(response.content);
    const parsed = extractJson<Omit<IntakeQuestionResponse, 'area'>>(text);
    const result: IntakeQuestionResponse = {
      ...parsed,
      area: phase === 'catch_all' ? '__catch_all__' : (current_area ?? '__catch_all__'),
    };
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
