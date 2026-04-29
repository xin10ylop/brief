import { getAnthropic } from '@/lib/anthropic';
import { CHAT_SYSTEM_PROMPT } from '@/lib/claude/prompts';
import type { ChatTurn, ExtractedContext, RecommendationOutput } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type ChatRequestBody = {
  message: string;
  history: ChatTurn[];
  recommendation: RecommendationOutput;
  context: ExtractedContext;
};

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const { message, history, recommendation, context } = body;
  if (!message || !recommendation || !context) {
    return new Response('message, recommendation, and context are required', { status: 400 });
  }

  let client;
  try {
    client = getAnthropic();
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'Server misconfigured', {
      status: 500,
    });
  }

  const systemBlocks = [
    CHAT_SYSTEM_PROMPT,
    `BUSINESS CONTEXT:\n${JSON.stringify(context, null, 2)}`,
    `PROPOSAL (the full recommendation JSON):\n${JSON.stringify(recommendation, null, 2)}`,
  ].join('\n\n');

  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user' as const, content: message },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const sdkStream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: systemBlocks,
          messages,
        });

        sdkStream.on('text', (text: string) => {
          controller.enqueue(encoder.encode(text));
        });

        await sdkStream.finalMessage();
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Stream error';
        controller.enqueue(encoder.encode(`\n\n[error: ${message}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
