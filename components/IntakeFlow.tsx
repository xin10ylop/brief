'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { TOKENS } from '@/lib/design/tokens';
import type { ChatMessage, IntakeQuestionResponse } from '@/lib/types';

type Props = {
  history: ChatMessage[];
  currentQuestion: IntakeQuestionResponse | null;
  loading: boolean;
  selectedAreas: string[];
  exploredAreas: string[];
  catchAllKey: string;
  onAnswer: (answer: string) => void;
  onReset: () => void;
};

export function IntakeFlow({
  history,
  currentQuestion,
  loading,
  selectedAreas,
  exploredAreas,
  catchAllKey,
  onAnswer,
  onReset,
}: Props) {
  const [openText, setOpenText] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [history, currentQuestion]);

  useEffect(() => {
    setOpenText('');
    setSelected([]);
    setOtherText('');
  }, [currentQuestion]);

  const isOptionQuestion = Boolean(
    currentQuestion &&
      (currentQuestion.input_type === 'single_select' ||
        currentQuestion.input_type === 'multi_select'),
  );

  const showOther = selected.some(
    (s) => s.toLowerCase().includes('something else') || s.toLowerCase().includes('other'),
  );

  const totalSteps = selectedAreas.length + 1; // areas + catch-all
  const isCatchAllPhase =
    currentQuestion?.area === catchAllKey ||
    (currentQuestion === null && exploredAreas.length >= selectedAreas.length);

  const exploredAreaCount = selectedAreas.filter((a) => exploredAreas.includes(a)).length;
  const completedSteps = exploredAreaCount + (exploredAreas.includes(catchAllKey) ? 1 : 0);
  const currentStepNumber = isCatchAllPhase
    ? selectedAreas.length + 1
    : Math.min(exploredAreaCount + 1, selectedAreas.length);

  const currentAreaLabel = useMemo(() => {
    if (!currentQuestion) return null;
    if (currentQuestion.area === catchAllKey) return 'Anything else';
    return currentQuestion.area;
  }, [currentQuestion, catchAllKey]);

  const handleSubmit = () => {
    if (!currentQuestion) return;
    if (currentQuestion.input_type === 'open_text') {
      if (openText.trim().length < 5) return;
      onAnswer(openText.trim());
      return;
    }
    if (currentQuestion.input_type === 'single_select') {
      if (selected.length === 0) return;
      const first = selected[0];
      const isOther =
        first.toLowerCase().includes('something else') || first.toLowerCase().includes('other');
      const answer = isOther && otherText.trim() ? otherText.trim() : first;
      onAnswer(answer);
      return;
    }
    if (currentQuestion.input_type === 'multi_select') {
      if (selected.length === 0) return;
      const hasOther = selected.some(
        (s) => s.toLowerCase().includes('something else') || s.toLowerCase().includes('other'),
      );
      let answer = selected.join(', ');
      if (hasOther && otherText.trim()) {
        answer = `${answer} (specifically: ${otherText.trim()})`;
      }
      onAnswer(answer);
    }
  };

  const toggleSelect = (option: string) => {
    if (!currentQuestion) return;
    if (currentQuestion.input_type === 'single_select') {
      setSelected([option]);
    } else {
      setSelected((prev) =>
        prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
      );
    }
  };

  const submitDisabled =
    !currentQuestion ||
    (currentQuestion.input_type === 'open_text' && openText.trim().length < 5) ||
    (isOptionQuestion && selected.length === 0);

  const progressFraction = totalSteps > 0 ? Math.min(completedSteps / totalSteps, 0.99) : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '24px 48px',
          borderBottom: `1px solid ${TOKENS.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div className="serif" style={{ fontSize: 22 }}>
          Brief<span className="accent-text">.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            className="mono"
            style={{ fontSize: 11, color: TOKENS.inkSecondary, letterSpacing: '0.05em' }}
          >
            {isCatchAllPhase
              ? 'CATCH-ALL'
              : `EXPLORING ${String(currentStepNumber).padStart(2, '0')} / ${String(
                  selectedAreas.length,
                ).padStart(2, '0')}`}
          </div>
          <button
            onClick={onReset}
            className="mono"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: TOKENS.inkTertiary,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={12} /> RESTART
          </button>
        </div>
      </header>

      <div style={{ height: 2, background: TOKENS.border }}>
        <div
          style={{
            height: '100%',
            background: 'var(--accent)',
            width: `${progressFraction * 100}%`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {selectedAreas.length > 0 && (
        <div
          style={{
            padding: '16px 48px',
            borderBottom: `1px solid ${TOKENS.border}`,
            background: TOKENS.surface,
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                color: TOKENS.inkTertiary,
                marginRight: 4,
              }}
            >
              AREAS
            </span>
            {selectedAreas.map((area) => {
              const done = exploredAreas.includes(area);
              const active = currentQuestion?.area === area;
              return (
                <span
                  key={area}
                  style={{
                    fontFamily: TOKENS.mono,
                    fontSize: 11,
                    padding: '4px 10px',
                    border: `1px solid ${
                      active ? 'var(--accent)' : done ? TOKENS.borderStrong : TOKENS.border
                    }`,
                    background: active ? 'var(--accent)' : 'transparent',
                    color: active
                      ? TOKENS.bg
                      : done
                      ? TOKENS.ink
                      : TOKENS.inkSecondary,
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: !active && !done ? 0.7 : 1,
                  }}
                >
                  {done && !active && <Check size={10} strokeWidth={3} />}
                  {area}
                </span>
              );
            })}
            <span
              style={{
                fontFamily: TOKENS.mono,
                fontSize: 11,
                padding: '4px 10px',
                border: `1px solid ${
                  isCatchAllPhase
                    ? 'var(--accent)'
                    : exploredAreas.includes(catchAllKey)
                    ? TOKENS.borderStrong
                    : TOKENS.border
                }`,
                background: isCatchAllPhase ? 'var(--accent)' : 'transparent',
                color: isCatchAllPhase
                  ? TOKENS.bg
                  : exploredAreas.includes(catchAllKey)
                  ? TOKENS.ink
                  : TOKENS.inkSecondary,
                letterSpacing: '0.04em',
                opacity: !isCatchAllPhase && !exploredAreas.includes(catchAllKey) ? 0.7 : 1,
              }}
            >
              Anything else
            </span>
          </div>
        </div>
      )}

      <main
        style={{
          flex: 1,
          padding: '48px 24px 200px',
          maxWidth: 720,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {currentAreaLabel && !loading && (
          <div
            className="micro-label fade-in"
            style={{ marginBottom: 24, color: 'var(--accent)' }}
          >
            Now exploring: {currentAreaLabel}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {history.map((msg, i) => {
            if (msg.role === 'user') {
              const display = msg.content.startsWith('Initial business description: ')
                ? msg.content.split('\n')[0].replace('Initial business description: ', '')
                : msg.content;
              return (
                <div
                  key={i}
                  className="fade-in"
                  style={{ alignSelf: 'flex-end', maxWidth: '85%' }}
                >
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: TOKENS.inkTertiary,
                      textAlign: 'right',
                      marginBottom: 6,
                      letterSpacing: '0.06em',
                    }}
                  >
                    YOU
                  </div>
                  <div
                    style={{
                      background: TOKENS.ink,
                      color: TOKENS.bg,
                      padding: '16px 20px',
                      fontSize: 15,
                      lineHeight: 1.55,
                      fontFamily: TOKENS.sans,
                    }}
                  >
                    {display}
                  </div>
                </div>
              );
            }
            try {
              const q = JSON.parse(msg.content) as IntakeQuestionResponse;
              return (
                <div
                  key={i}
                  className="fade-in"
                  style={{ alignSelf: 'flex-start', maxWidth: '90%' }}
                >
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: TOKENS.inkTertiary,
                      marginBottom: 6,
                      letterSpacing: '0.06em',
                    }}
                  >
                    BRIEF{q.area && q.area !== catchAllKey ? ` · ${q.area}` : ''}
                  </div>
                  {q.context_acknowledgment && (
                    <div
                      style={{
                        fontSize: 14,
                        color: TOKENS.inkTertiary,
                        marginBottom: 8,
                        fontStyle: 'italic',
                      }}
                    >
                      {q.context_acknowledgment}
                    </div>
                  )}
                  <div
                    className="serif"
                    style={{ fontSize: 24, lineHeight: 1.3, color: TOKENS.ink }}
                  >
                    {q.question_text}
                  </div>
                </div>
              );
            } catch {
              return null;
            }
          })}

          {currentQuestion && !loading && (
            <div
              className="fade-in"
              style={{ alignSelf: 'flex-start', maxWidth: '90%', width: '100%' }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: TOKENS.inkTertiary,
                  marginBottom: 6,
                  letterSpacing: '0.06em',
                }}
              >
                BRIEF
                {currentQuestion.area && currentQuestion.area !== catchAllKey
                  ? ` · ${currentQuestion.area}`
                  : ''}
              </div>
              {currentQuestion.context_acknowledgment && (
                <div
                  style={{
                    fontSize: 14,
                    color: TOKENS.inkTertiary,
                    marginBottom: 8,
                    fontStyle: 'italic',
                  }}
                >
                  {currentQuestion.context_acknowledgment}
                </div>
              )}
              <div
                className="serif"
                style={{
                  fontSize: 26,
                  lineHeight: 1.3,
                  color: TOKENS.ink,
                  marginBottom: 24,
                }}
              >
                {currentQuestion.question_text}
              </div>

              {currentQuestion.input_type === 'open_text' && (
                <textarea
                  className="b-textarea"
                  placeholder="Take as much space as you need."
                  value={openText}
                  onChange={(e) => setOpenText(e.target.value)}
                  rows={3}
                  autoFocus
                />
              )}

              {isOptionQuestion && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(currentQuestion.options || []).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`option-card ${selected.includes(opt) ? 'selected' : ''}`}
                      onClick={() => toggleSelect(opt)}
                    >
                      <div className="check-icon">
                        {selected.includes(opt) && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span style={{ flex: 1 }}>{opt}</span>
                    </button>
                  ))}
                  {showOther && (
                    <input
                      className="b-input"
                      style={{ marginTop: 8 }}
                      placeholder="Tell us more"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      autoFocus
                    />
                  )}
                  {currentQuestion.input_type === 'multi_select' && (
                    <div
                      className="mono"
                      style={{ fontSize: 11, color: TOKENS.inkTertiary, marginTop: 4 }}
                    >
                      Pick all that apply
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 20 }}>
                <button onClick={handleSubmit} className="b-btn" disabled={submitDisabled}>
                  Continue
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div
              className="fade-in"
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: TOKENS.inkTertiary,
              }}
            >
              <div
                className="pulse"
                style={{
                  width: 8,
                  height: 8,
                  background: 'var(--accent)',
                  borderRadius: '50%',
                }}
              />
              <span className="mono" style={{ fontSize: 12 }}>
                Brief is reading your answer
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>
    </div>
  );
}
