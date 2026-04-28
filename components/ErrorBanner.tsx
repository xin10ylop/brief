'use client';

import { X } from 'lucide-react';

export function ErrorBanner({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#FEF2F2',
        color: '#991B1B',
        border: '1px solid #FCA5A5',
        padding: '12px 20px',
        zIndex: 100,
        maxWidth: 600,
        fontSize: 14,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <span style={{ flex: 1 }}>{error}</span>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
