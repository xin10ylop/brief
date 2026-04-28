export function extractJson<T = unknown>(text: string): T {
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON found in model response');
  }
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
