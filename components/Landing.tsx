'use client';

import { ArrowRight, RotateCcw, X } from 'lucide-react';
import { TOKENS } from '@/lib/design/tokens';
import type { SavedSession } from '@/lib/types';

type LandingProps = {
  description: string;
  setDescription: (v: string) => void;
  onSubmit: (description: string) => void;
  savedSession: SavedSession | null;
  onResume: () => void;
  onDiscardSaved: () => void;
};

export function Landing({
  description,
  setDescription,
  onSubmit,
  savedSession,
  onResume,
  onDiscardSaved,
}: LandingProps) {
  const canSubmit = description.trim().length >= 30;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) onSubmit(description.trim());
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '32px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div className="serif" style={{ fontSize: 40, letterSpacing: '-0.01em', lineHeight: 1 }}>
          Brief
          <span className="accent-text" style={{ marginLeft: 2 }}>.</span>
        </div>
        <div className="micro-label">A project by Nicolas Tawil</div>
      </header>

      {savedSession && (
        <div
          style={{
            margin: '0 48px',
            padding: '16px 20px',
            background: TOKENS.surface,
            border: `1px solid ${TOKENS.border}`,
            borderLeft: `3px solid var(--accent)`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div className="mono" style={{ fontSize: 11, color: TOKENS.inkTertiary, letterSpacing: '0.06em', marginBottom: 4 }}>
              SAVED PROPOSAL
            </div>
            <div style={{ fontSize: 14, color: TOKENS.ink }}>
              You have a previous proposal for{' '}
              <strong style={{ fontWeight: 500 }}>{savedSession.context.industry_label}</strong>.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onResume}
              className="mono"
              style={{
                background: TOKENS.ink,
                color: TOKENS.bg,
                border: 'none',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 11,
                letterSpacing: '0.06em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RotateCcw size={12} /> RESUME
            </button>
            <button
              onClick={onDiscardSaved}
              className="mono"
              style={{
                background: 'transparent',
                color: TOKENS.inkSecondary,
                border: `1px solid ${TOKENS.border}`,
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 11,
                letterSpacing: '0.06em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <X size={12} /> DISCARD
            </button>
          </div>
        </div>
      )}

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          maxWidth: 720,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div className="stagger-in" style={{ width: '100%' }}>
          <div className="micro-label" style={{ marginBottom: 20 }}>
            A productivity proposal generator
          </div>

          <h1
            className="serif"
            style={{
              fontSize: 'clamp(40px, 7vw, 76px)',
              lineHeight: 1.05,
              fontWeight: 400,
              margin: 0,
              letterSpacing: '-0.02em',
              color: TOKENS.ink,
            }}
          >
            Where AI actually moves the needle in your{' '}
            <em style={{ color: 'var(--accent)' }}>business.</em>
          </h1>

          <p
            style={{
              fontSize: 19,
              lineHeight: 1.55,
              color: TOKENS.inkSecondary,
              marginTop: 32,
              marginBottom: 40,
              maxWidth: 560,
            }}
          >
            Describe your business. Brief will ask a few focused questions, then produce a custom proposal showing exactly where Claude can save your team time across customer support, finance, operations, sales, and more.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="micro-label" style={{ display: 'block', marginBottom: 12 }}>
              Your company or product
            </label>
            <textarea
              className="b-textarea"
              placeholder="What does your business do? Who are your customers? Tell us as much or as little as you'd like."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <span className="mono" style={{ fontSize: 12, color: TOKENS.inkTertiary }}>
                {description.trim().length} characters
                {!canSubmit && description.length > 0 ? ', 30 minimum to continue' : ''}
              </span>
              <button type="submit" className="b-btn" disabled={!canSubmit}>
                Begin intake
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 24,
              marginTop: 80,
            }}
          >
            {[
              {
                num: '01',
                title: 'Specific, not generic',
                body: 'Every recommendation is tailored to your actual workflows, not a template.',
              },
              {
                num: '02',
                title: 'Human always in control',
                body: "Every proposal names the specific person who reviews and approves Claude's output.",
              },
              {
                num: '03',
                title: 'Across every part of your business',
                body: 'From customer support to finance to operations, wherever the opportunity is.',
              },
            ].map((card) => (
              <div key={card.num} style={{ borderTop: `1px solid ${TOKENS.border}`, paddingTop: 20 }}>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: TOKENS.inkTertiary, marginBottom: 12 }}
                >
                  {card.num}
                </div>
                <div className="serif" style={{ fontSize: 22, lineHeight: 1.25, marginBottom: 10 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: TOKENS.inkSecondary }}>
                  {card.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer
        style={{
          padding: '32px 48px',
          borderTop: `1px solid ${TOKENS.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: 12,
        }}
      >
        <div className="mono" style={{ color: TOKENS.inkTertiary }}>
          Proposals generated with Claude. Estimates are conservative by design.
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a
            href="https://www.anthropic.com/legal/aup"
            target="_blank"
            rel="noopener noreferrer"
            className="mono"
            style={{
              color: TOKENS.inkSecondary,
              textDecoration: 'none',
              borderBottom: `1px solid ${TOKENS.border}`,
            }}
          >
            Anthropic Usage Policy
          </a>
          <span className="mono" style={{ color: TOKENS.inkTertiary }}>
            Built by Nicolas Tawil
          </span>
        </div>
      </footer>
    </div>
  );
}
