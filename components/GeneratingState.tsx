'use client';

import { TOKENS } from '@/lib/design/tokens';

export function GeneratingState({ status }: { status: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: TOKENS.inkTertiary,
          marginBottom: 32,
          letterSpacing: '0.08em',
        }}
      >
        DRAFTING YOUR PROPOSAL
      </div>
      <div
        className="serif"
        style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          lineHeight: 1.2,
          textAlign: 'center',
          maxWidth: 600,
          fontWeight: 400,
          fontStyle: 'italic',
          color: TOKENS.ink,
        }}
      >
        {status || 'Working'}
      </div>
      <div
        style={{
          width: 200,
          height: 1,
          background: TOKENS.border,
          marginTop: 60,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width: '40%',
            background: 'var(--accent)',
            animation: 'slide 1.8s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
