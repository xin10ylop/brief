import Anthropic from '@anthropic-ai/sdk';

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export function firstText(blocks: Anthropic.ContentBlock[]): string {
  for (const block of blocks) {
    if (block.type === 'text') return block.text;
  }
  return '';
}
