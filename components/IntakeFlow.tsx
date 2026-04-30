'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { TOKENS } from '@/lib/design/tokens';
import type {
  ChatMessage,
  IntakePhase,
  IntakeQuestionResponse,
} from '@/lib/types';

type Props = {
  history: ChatMessage[];
  currentQuestion: IntakeQuestionResponse | null;
  loading: boolean;
  phase: IntakePhase;
  selectedAreas: string[];
  exploredAreas: string[];
  catchAllKey: string;
  onAnswer: (answer: string) => void;
  onReset: () => void;
};

function phaseLabel(phase: IntakePhase, selectedAreas: string[], exploredAreas: string[]) {
  if (phase === 'opening') return 'GETTING TO KNOW YOU';
  if (phase === 'area_selection') return 'CHOOSE AREAS';
  if (phase === 'catch_all') return 'CATCH-ALL';
  if (phase === 'area_question') {
    const exploredCount = selectedAreas.filter((a) => exploredAreas.includes(a)).length;
    const total = selectedAreas.length;
    return `EXPLORING ${String(Math.min(exploredCount + 1, total)).padStart(2, '0')} / ${String(
      total,
    ).padStart(2, '0')}`;
  }
  return '';
}

export function IntakeFlow({
  history,
  currentQuestion,
  loading,
  phase,
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
  const isAreaQuestion = currentQuestion?.input_type === 'area_select';

  const showOther = selected.some(
    (s) => s.toLowerCase().includes('something else') || s.toLowerCase().includes('other'),
  );

  const totalAreaSteps = selectedAreas.length + 1;
  const completedAreaSteps =
    selectedAreas.filter((a) => exploredAreas.includes(a)).length +
    (exploredAreas.includes(catchAllKey) ? 1 : 0);
  const progressFraction = (() => {
    if (phase === 'opening') return 0.1;
    if (phase === 'area_selection') return 0.25;
    if (totalAreaSteps === 0) return 0.5;
    return Math.min(0.3 + (completedAreaSteps / totalAreaSteps) * 0.7, 0.99);
  })();

  const currentAreaLabel = useMemo(() => {
    if (!currentQuestion) return null;
    if (currentQuestion.area === catchAllKey) return 'Anything else';
    if (currentQuestion.area === '__opening__' || currentQuestion.area === '__area_selection__') {
      return null;
    }
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
    if (
      currentQuestion.input_type === 'multi_select' ||
      currentQuestion.input_type === 'area_select'
    ) {
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
    ((isOptionQuestion || isAreaQuestion) && selected.length === 0);

  const showChipRail = phase === 'area_question' || phase === 'catch_all';

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
            {phaseLabel(phase, selectedAreas, exploredAreas)}
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

      {showChipRail && selectedAreas.length > 0 && (
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
                  phase === 'catch_all'
                    ? 'var(--accent)'
                    : exploredAreas.includes(catchAllKey)
                    ? TOKENS.borderStrong
                    : TOKENS.border
                }`,
                background: phase === 'catch_all' ? 'var(--accent)' : 'transparent',
                color:
                  phase === 'catch_all'
                    ? TOKENS.bg
                    : exploredAreas.includes(catchAllKey)
                    ? TOKENS.ink
                    : TOKENS.inkSecondary,
                letterSpacing: '0.04em',
                opacity:
                  phase !== 'catch_all' && !exploredAreas.includes(catchAllKey) ? 0.7 : 1,
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
          maxWidth: isAreaQuestion ? 1000 : 720,
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
                ? msg.content.replace('Initial business description: ', '')
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
              const showArea =
                q.area &&
                q.area !== '__opening__' &&
                q.area !== '__area_selection__' &&
                q.area !== catchAllKey;
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
                    BRIEF{showArea ? ` · ${q.area}` : ''}
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
              style={{ alignSelf: 'flex-start', maxWidth: '95%', width: '100%' }}
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
                {currentQuestion.area &&
                currentQuestion.area !== '__opening__' &&
                currentQuestion.area !== '__area_selection__' &&
                currentQuestion.area !== catchAllKey
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

              {isAreaQuestion && (
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {(currentQuestion.area_options || []).map((opt) => {
                      const isSelected = selected.includes(opt.label);
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => toggleSelect(opt.label)}
                          className={`option-card ${isSelected ? 'selected' : ''}`}
                          style={{ alignItems: 'flex-start', minHeight: 88 }}
                        >
                          <div className="check-icon" style={{ marginTop: 2 }}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 15,
                                color: TOKENS.ink,
                                marginBottom: opt.helper ? 6 : 0,
                              }}
                            >
                              {opt.label}
                            </div>
                            {opt.helper && (
                              <div
                                style={{
                                  fontSize: 13,
                                  color: TOKENS.inkSecondary,
                                  lineHeight: 1.45,
                                }}
                              >
                                {opt.helper}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {showOther && (
                    <input
                      className="b-input"
                      style={{ marginTop: 12 }}
                      placeholder="Describe the area you want us to look at"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      autoFocus
                    />
                  )}
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: TOKENS.inkTertiary, marginTop: 12 }}
                  >
                    Pick every area you want us to explore. We will dig into each one.
                  </div>
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
