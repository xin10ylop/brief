'use client';

import { TOKENS } from '@/lib/design/tokens';
import type { Recommendation } from '@/lib/types';

export function WorkflowDetail({ rec, index }: { rec: Recommendation; index: number }) {
  return (
    <section id={`workflow-${index}`} className="pitch-section fade-in">
      <div className="micro-label" style={{ marginBottom: 16 }}>
        WORKFLOW {String(index + 1).padStart(2, '0')}
      </div>
      <h2
        className="serif"
        style={{
          fontSize: 'clamp(36px, 5vw, 56px)',
          lineHeight: 1.05,
          fontWeight: 400,
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em',
          maxWidth: 900,
        }}
      >
        {rec.workflow_name}
      </h2>
      <p
        style={{
          fontSize: 20,
          lineHeight: 1.55,
          color: TOKENS.inkSecondary,
          marginBottom: 64,
          maxWidth: 720,
        }}
      >
        {rec.workflow_one_liner}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 0,
          border: `1px solid ${TOKENS.border}`,
          background: TOKENS.surface,
        }}
      >
        <div style={{ padding: '28px 28px', borderRight: `1px solid ${TOKENS.border}` }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: TOKENS.inkTertiary,
              letterSpacing: '0.08em',
              marginBottom: 14,
            }}
          >
            CURRENT STATE
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: TOKENS.ink }}>
            {rec.current_state}
          </div>
        </div>
        <div
          style={{
            padding: '28px 28px',
            borderRight: `1px solid ${TOKENS.border}`,
            borderLeft: `3px solid var(--accent)`,
            marginLeft: -1,
            position: 'relative',
          }}
        >
          <div
            className="mono accent-text"
            style={{ fontSize: 10, letterSpacing: '0.08em', marginBottom: 14, fontWeight: 500 }}
          >
            WHERE CLAUDE INSERTS
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: TOKENS.ink }}>
            <strong style={{ fontWeight: 500 }}>{rec.insertion_point.step}.</strong>{' '}
            {rec.insertion_point.what_claude_does}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              lineHeight: 1.55,
              color: TOKENS.inkSecondary,
              fontStyle: 'italic',
            }}
          >
            {rec.insertion_point.handoff_format}
          </div>
        </div>
        <div style={{ padding: '28px 28px' }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: TOKENS.inkTertiary,
              letterSpacing: '0.08em',
              marginBottom: 14,
            }}
          >
            HUMAN AUTHORITY
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: TOKENS.ink }}>
            <strong style={{ fontWeight: 500 }}>
              {rec.insertion_point.human_authority.role}
            </strong>
            <div style={{ marginTop: 8, color: TOKENS.inkSecondary }}>
              {rec.insertion_point.human_authority.responsibility}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32,
          marginTop: 48,
        }}
      >
        <div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: TOKENS.inkTertiary,
              letterSpacing: '0.08em',
              marginBottom: 14,
            }}
          >
            EXPECTED LIFT
          </div>
          <div
            className="serif"
            style={{
              fontSize: 32,
              lineHeight: 1.2,
              color: TOKENS.ink,
              marginBottom: 12,
              letterSpacing: '-0.01em',
            }}
          >
            {rec.expected_lift.estimate}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: TOKENS.inkSecondary }}>
            {rec.expected_lift.reasoning}
          </div>
        </div>
        <div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: TOKENS.inkTertiary,
              letterSpacing: '0.08em',
              marginBottom: 14,
            }}
          >
            CONFIDENCE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div
                className="mono"
                style={{ fontSize: 10, color: TOKENS.inkTertiary, marginBottom: 4 }}
              >
                RELIABLE FOR
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: TOKENS.ink }}>
                {rec.confidence.reliable_for}
              </div>
            </div>
            <div>
              <div
                className="mono"
                style={{ fontSize: 10, color: TOKENS.inkTertiary, marginBottom: 4 }}
              >
                WILL STRUGGLE WITH
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: TOKENS.ink }}>
                {rec.confidence.will_struggle_with}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${TOKENS.border}` }}
      >
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: TOKENS.inkTertiary,
            letterSpacing: '0.08em',
            marginBottom: 24,
          }}
        >
          FIRST 90 DAYS
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
          }}
        >
          {[
            { label: 'DAY 30', text: rec.first_90_days?.day_30 },
            { label: 'DAY 60', text: rec.first_90_days?.day_60 },
            { label: 'DAY 90', text: rec.first_90_days?.day_90 },
          ].map((item) => (
            <div key={item.label} style={{ position: 'relative', paddingLeft: 0 }}>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: 'var(--accent)',
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: TOKENS.ink }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
