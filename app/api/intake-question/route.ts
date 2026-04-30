import { NextResponse } from 'next/server';
import { getAnthropic, firstText } from '@/lib/anthropic';
import { INTAKE_QUESTION_PROMPT } from '@/lib/claude/prompts';
import { extractJson } from '@/lib/json';
import type {
  ChatMessage,
  IntakePhase,
  IntakeQuestion,
  IntakeQuestionResponse,
} from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RequestBody = {
  history: ChatMessage[];
  phase: IntakePhase;
  opening_turn?: number;
  selected_areas: string[];
  explored_areas: string[];
  current_area: string | null;
};

const CATCH_ALL_KEY = '__catch_all__';

function buildDirective(body: RequestBody): string {
  const { phase, opening_turn, selected_areas, explored_areas, current_area } = body;

  const lines: string[] = [];
  lines.push(`SELECTED AREAS (in user-chosen order): ${selected_areas.length > 0 ? selected_areas.join(' | ') : '(none yet)'}`);
  lines.push(`AREAS ALREADY EXPLORED: ${explored_areas.length > 0 ? explored_areas.join(' | ') : 'none'}`);

  if (phase === 'opening') {
    const turn = opening_turn ?? 1;
    lines.push(`PHASE: opening_turn_${turn}`);
    if (turn === 1) {
      lines.push('Ask the team-shape question now.');
    } else {
      lines.push('Ask the broad pain-points question now.');
    }
  } else if (phase === 'area_selection') {
    lines.push('PHASE: area_selection');
    lines.push(
      'Generate the tailored area_select question now. Options must be specific to THIS business in their language. Include 8 to 12 entries plus a final "Something else" entry.',
    );
  } else if (phase === 'area_question') {
    lines.push(`PHASE: area_question`);
    lines.push(`CURRENT AREA: ${current_area ?? '(unspecified)'}`);
    lines.push(
      `Ask exactly one focused question about how the "${current_area}" workflow currently works in THIS business. Reference details the user has already shared. Do not ask about any other area.`,
    );
  } else if (phase === 'catch_all') {
    lines.push('PHASE: catch_all');
    lines.push('Generate the final open-text catch-all question now.');
  }

  return lines.join('\n');
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { history, phase, current_area } = body;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json({ error: 'history is required' }, { status: 400 });
    }
    if (!phase) {
      return NextResponse.json({ error: 'phase is required' }, { status: 400 });
    }

    const directive = buildDirective(body);

    const messages: ChatMessage[] = [
      ...history,
      { role: 'user', content: `[ORCHESTRATOR INSTRUCTIONS]\n${directive}` },
    ];

    const client = getAnthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: INTAKE_QUESTION_PROMPT,
      messages,
    });

    const text = firstText(response.content);
    const parsed = extractJson<IntakeQuestion>(text);

    let area = '__opening__';
    if (phase === 'area_selection') area = '__area_selection__';
    else if (phase === 'area_question') area = current_area ?? CATCH_ALL_KEY;
    else if (phase === 'catch_all') area = CATCH_ALL_KEY;

    const result: IntakeQuestionResponse = { ...parsed, area };
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
