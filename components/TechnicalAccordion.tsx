'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TOKENS } from '@/lib/design/tokens';
import type { Recommendation } from '@/lib/types';

export function TechnicalAccordion({
  rec,
  index,
  isLast,
}: {
  rec: Recommendation;
  index: number;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: isLast ? 'none' : `1px solid ${TOKENS.border}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '24px 28px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
          fontFamily: TOKENS.sans,
          color: TOKENS.ink,
        }}
      >
        <div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: TOKENS.inkTertiary,
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}
          >
            WORKFLOW {String(index + 1).padStart(2, '0')}
          </div>
          <div className="serif" style={{ fontSize: 20, lineHeight: 1.3 }}>
            {rec.workflow_name}
          </div>
        </div>
        <ChevronDown
          size={18}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
            color: TOKENS.inkSecondary,
          }}
        />
      </button>
      <div className={`accordion-content ${open ? 'open' : ''}`}>
        <div
          style={{
            padding: '0 28px 28px 28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: TOKENS.inkTertiary,
                letterSpacing: '0.08em',
                marginBottom: 10,
              }}
            >
              CLAUDE SURFACES
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(rec.technical?.surfaces || []).map((s) => (
                <span key={s} className="pill">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: TOKENS.inkTertiary,
                letterSpacing: '0.08em',
                marginBottom: 10,
              }}
            >
              PRIMITIVES
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(rec.technical?.primitives || []).map((s) => (
                <span key={s} className="pill">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: TOKENS.inkTertiary,
                letterSpacing: '0.08em',
                marginBottom: 10,
              }}
            >
              PATTERN
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: TOKENS.ink }}>
              {rec.technical?.pattern}
            </div>
          </div>
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: TOKENS.inkTertiary,
                letterSpacing: '0.08em',
                marginBottom: 10,
              }}
            >
              INTEGRATIONS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(rec.technical?.integrations || []).map((s) => (
                <span key={s} className="pill">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: TOKENS.inkTertiary,
                letterSpacing: '0.08em',
                marginBottom: 10,
              }}
            >
              BUILD COMPLEXITY
            </div>
            <span
              className="pill"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              {rec.technical?.complexity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
