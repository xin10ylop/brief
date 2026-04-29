'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { TOKENS } from '@/lib/design/tokens';
import type { ChatTurn, ExtractedContext, RecommendationOutput } from '@/lib/types';

type Props = {
  recommendation: RecommendationOutput;
  context: ExtractedContext;
  chat: ChatTurn[];
  onChatUpdate: (next: ChatTurn[]) => void;
};

function buildSuggestionChips(rec: RecommendationOutput): string[] {
  const out: string[] = [];
  const first = rec.recommendations?.[0];
  if (rec.recommendations && rec.recommendations.length > 1) {
    out.push('Which workflow should I start with?');
  }
  if (first) {
    out.push(`How long would ${first.workflow_name} take to build?`);
  }
  out.push('How much would this cost to run each month?');
  out.push('What engineering skills do I need to ship this?');
  const allPrimitives = (rec.recommendations || []).flatMap((r) => r.technical?.primitives || []);
  if (allPrimitives.some((p) => /mcp/i.test(p))) {
    out.push('What does MCP mean in plain language?');
  }
  if (allPrimitives.some((p) => /caching/i.test(p))) {
    out.push('How does prompt caching reduce my costs?');
  }
  return out.slice(0, 5);
}

export function PitchChat({ recommendation, context, chat, onChatUpdate }: Props) {
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const chips = useMemo(() => buildSuggestionChips(recommendation), [recommendation]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat, streaming]);

  const send = async (raw: string) => {
    const message = raw.trim();
    if (!message || streaming) return;
    setInput('');

    const baseHistory: ChatTurn[] = [...chat, { role: 'user', content: message }];
    onChatUpdate(baseHistory);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: chat,
          recommendation,
          context,
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => 'Chat request failed');
        onChatUpdate([...baseHistory, { role: 'assistant', content: text }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      onChatUpdate([...baseHistory, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        onChatUpdate([...baseHistory, { role: 'assistant', content: acc }]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stream failed';
      onChatUpdate([...baseHistory, { role: 'assistant', content: `[error: ${message}]` }]);
    } finally {
      setStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <section className="pitch-section fade-in" style={{ paddingBottom: 48 }}>
      <div className="micro-label" style={{ marginBottom: 16 }}>
        07 · Ask follow-ups
      </div>
      <h2
        className="serif"
        style={{
          fontSize: 'clamp(32px, 4vw, 44px)',
          lineHeight: 1.1,
          fontWeight: 400,
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em',
        }}
      >
        Questions about this proposal.
      </h2>
      <p style={{ fontSize: 15, color: TOKENS.inkSecondary, marginBottom: 32, maxWidth: 720 }}>
        Ask anything about the workflows above: timelines, costs, engineering effort, what a
        primitive means, what to ship first.
      </p>

      <div
        style={{
          border: `1px solid ${TOKENS.border}`,
          background: TOKENS.surface,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {chat.length === 0 && (
          <div
            style={{
              fontSize: 14,
              color: TOKENS.inkTertiary,
              fontStyle: 'italic',
              padding: '16px 0',
            }}
          >
            No questions yet. Pick a suggestion below or type your own.
          </div>
        )}

        {chat.map((turn, i) => (
          <div
            key={i}
            style={{
              alignSelf: turn.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: TOKENS.inkTertiary,
                letterSpacing: '0.06em',
                marginBottom: 6,
                textAlign: turn.role === 'user' ? 'right' : 'left',
              }}
            >
              {turn.role === 'user' ? 'YOU' : 'BRIEF'}
            </div>
            <div
              style={{
                background: turn.role === 'user' ? TOKENS.ink : 'transparent',
                color: turn.role === 'user' ? TOKENS.bg : TOKENS.ink,
                border:
                  turn.role === 'assistant' ? `1px solid ${TOKENS.border}` : 'none',
                padding: '14px 18px',
                fontSize: 15,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {turn.content || (streaming && i === chat.length - 1 ? '...' : '')}
            </div>
          </div>
        ))}

        {streaming && chat[chat.length - 1]?.role !== 'assistant' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: TOKENS.inkTertiary,
              fontSize: 13,
            }}
          >
            <Loader2 size={14} className="pulse" /> Brief is composing
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => send(chip)}
            disabled={streaming}
            style={{
              background: 'transparent',
              border: `1px solid ${TOKENS.border}`,
              padding: '8px 14px',
              fontSize: 13,
              color: TOKENS.inkSecondary,
              cursor: streaming ? 'not-allowed' : 'pointer',
              opacity: streaming ? 0.5 : 1,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!streaming) {
                e.currentTarget.style.borderColor = TOKENS.ink;
                e.currentTarget.style.color = TOKENS.ink;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = TOKENS.border;
              e.currentTarget.style.color = TOKENS.inkSecondary;
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'stretch',
        }}
      >
        <input
          type="text"
          className="b-input"
          style={{ flex: 1, padding: '14px 18px', fontSize: 15 }}
          placeholder="Ask anything about your proposal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={streaming}
        />
        <button
          type="submit"
          className="b-btn"
          disabled={streaming || input.trim().length === 0}
          style={{ padding: '0 20px' }}
          aria-label="Send"
        >
          {streaming ? <Loader2 size={16} className="pulse" /> : <ArrowUp size={16} />}
        </button>
      </form>
    </section>
  );
}
