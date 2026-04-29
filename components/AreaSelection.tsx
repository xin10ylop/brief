'use client';

import { useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { TOKENS } from '@/lib/design/tokens';
import { AREAS, CUSTOM_AREA_ID } from '@/lib/areas';

type Props = {
  description: string;
  onSubmit: (selectedIds: string[], customText?: string) => void;
  onReset: () => void;
};

export function AreaSelection({ description, onSubmit, onReset }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const customSelected = selected.includes(CUSTOM_AREA_ID);
  const canSubmit = selected.length > 0 && (!customSelected || customText.trim().length >= 5);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(selected, customSelected ? customText.trim() : undefined);
  };

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
            STEP 01 / 03 · CHOOSE AREAS
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

      <main
        style={{
          flex: 1,
          padding: '48px 24px 120px',
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div className="micro-label" style={{ marginBottom: 16 }}>
          Where to look
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 1.1,
            fontWeight: 400,
            margin: '0 0 20px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Pick the areas you want us to look at.
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: TOKENS.inkSecondary,
            maxWidth: 720,
            marginBottom: 16,
          }}
        >
          Select every area where you would consider a Claude implementation. We will ask one
          focused follow-up about each one. Pick at least one.
        </p>
        {description && (
          <div
            style={{
              fontSize: 13,
              color: TOKENS.inkTertiary,
              fontStyle: 'italic',
              marginBottom: 32,
              maxWidth: 720,
            }}
          >
            About your business: &ldquo;{description.slice(0, 240)}
            {description.length > 240 ? '...' : ''}&rdquo;
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {AREAS.map((area) => {
            const isSelected = selected.includes(area.id);
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => toggle(area.id)}
                className={`option-card ${isSelected ? 'selected' : ''}`}
                style={{ alignItems: 'flex-start', minHeight: 96 }}
              >
                <div className="check-icon" style={{ marginTop: 2 }}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: TOKENS.ink, marginBottom: 6 }}>
                    {area.label}
                  </div>
                  <div
                    style={{ fontSize: 13, color: TOKENS.inkSecondary, lineHeight: 1.45 }}
                  >
                    {area.helper}
                  </div>
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => toggle(CUSTOM_AREA_ID)}
            className={`option-card ${customSelected ? 'selected' : ''}`}
            style={{ alignItems: 'flex-start', minHeight: 96 }}
          >
            <div className="check-icon" style={{ marginTop: 2 }}>
              {customSelected && <Check size={12} strokeWidth={3} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: TOKENS.ink, marginBottom: 6 }}>
                Something I have in mind
              </div>
              <div style={{ fontSize: 13, color: TOKENS.inkSecondary, lineHeight: 1.45 }}>
                Describe your own idea below
              </div>
            </div>
          </button>
        </div>

        {customSelected && (
          <div style={{ marginTop: 20, maxWidth: 720 }}>
            <label className="micro-label" style={{ display: 'block', marginBottom: 10 }}>
              Tell us what you have in mind
            </label>
            <textarea
              className="b-textarea"
              rows={3}
              placeholder="A workflow you have been thinking about, an idea you want us to consider..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
          </div>
        )}

        <div
          style={{
            marginTop: 40,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span className="mono" style={{ fontSize: 12, color: TOKENS.inkTertiary }}>
            {selected.length} selected
          </span>
          <button onClick={handleSubmit} className="b-btn" disabled={!canSubmit}>
            Continue to intake
            <ArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
