'use client';

import { ArrowUpRight, ChevronRight, FileText, Link2, RotateCcw } from 'lucide-react';
import { TOKENS } from '@/lib/design/tokens';
import type { ExtractedContext, RecommendationOutput } from '@/lib/types';
import { WorkflowDetail } from './WorkflowDetail';
import { TechnicalAccordion } from './TechnicalAccordion';

type Props = {
  recommendation: RecommendationOutput;
  context: ExtractedContext;
  onReset: () => void;
};

export function Pitch({ recommendation, context, onReset }: Props) {
  const { diagnosis, thesis_statement, recommendations, strategic_exclusions, policy } =
    recommendation;
  const isNotNow = diagnosis.overall_recommendation === 'not_now';
  const date = new Date()
    .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    .toUpperCase();

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <div>
      <header
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: TOKENS.bg,
          borderBottom: `1px solid ${TOKENS.border}`,
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="serif" style={{ fontSize: 18 }}>
            Brief<span className="accent-text">.</span>
          </div>
          <div style={{ width: 1, height: 16, background: TOKENS.borderStrong }} />
          <div
            className="mono"
            style={{ fontSize: 11, color: TOKENS.inkSecondary, letterSpacing: '0.05em' }}
          >
            PROPOSAL FOR{' '}
            <span style={{ color: TOKENS.ink }}>{context.industry_label.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <button
            onClick={handleCopyLink}
            className="mono"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: TOKENS.inkSecondary,
              fontSize: 11,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Link2 size={12} /> COPY LINK
          </button>
          <button
            onClick={handlePrint}
            className="mono"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: TOKENS.inkSecondary,
              fontSize: 11,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FileText size={12} /> EXPORT PDF
          </button>
          <button
            onClick={onReset}
            className="mono"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: TOKENS.inkTertiary,
              fontSize: 11,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={12} /> NEW
          </button>
        </div>
      </header>

      {/* Title */}
      <section
        className="pitch-section fade-in"
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: TOKENS.inkTertiary,
            marginBottom: 60,
            letterSpacing: '0.08em',
          }}
        >
          {date} · A PRODUCTIVITY PROPOSAL
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 'clamp(48px, 8vw, 110px)',
            lineHeight: 1.0,
            fontWeight: 400,
            margin: 0,
            letterSpacing: '-0.02em',
            maxWidth: '90%',
          }}
        >
          For {context.industry_label.toLowerCase()}
          <span className="accent-text">.</span>
        </h1>
        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            color: TOKENS.inkSecondary,
            fontStyle: 'italic',
            maxWidth: 580,
            lineHeight: 1.5,
          }}
        >
          A measured assessment of where Claude can compress your team&apos;s time, and where we
          would not ask it to.
        </div>
      </section>

      {/* Diagnosis */}
      <section className="pitch-section fade-in">
        <div className="micro-label" style={{ marginBottom: 16 }}>
          01 · Diagnosis
        </div>
        <h2
          className="serif"
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 1.1,
            fontWeight: 400,
            margin: '0 0 32px 0',
            letterSpacing: '-0.02em',
          }}
        >
          What we heard.
        </h2>
        <p
          style={{
            fontSize: 22,
            lineHeight: 1.55,
            color: TOKENS.ink,
            maxWidth: 720,
            margin: 0,
          }}
        >
          {diagnosis.business_understanding}
        </p>

        <div
          style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 0,
            border: `1px solid ${TOKENS.border}`,
            background: TOKENS.surface,
          }}
        >
          {[
            { label: 'INDUSTRY', value: context.industry_label },
            { label: 'TEAM SIGNALS', value: context.team_signals },
            { label: 'AI MATURITY', value: context.ai_maturity },
            { label: 'CONSTRAINTS', value: context.regulatory_constraints },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                padding: '24px 28px',
                borderRight: i < 3 ? `1px solid ${TOKENS.border}` : 'none',
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: TOKENS.inkTertiary,
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.45, color: TOKENS.ink }}>{item.value}</div>
            </div>
          ))}
        </div>

        {policy && policy.flag !== 'none' && (
          <div
            style={{
              marginTop: 32,
              padding: '20px 24px',
              background: TOKENS.surface,
              border: `1px solid ${TOKENS.border}`,
              borderLeft: `3px solid var(--accent)`,
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: 'var(--accent)',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              {policy.flag === 'prohibited'
                ? 'POLICY: PROHIBITED CATEGORY'
                : 'POLICY: HIGH-RISK CATEGORY'}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: TOKENS.ink }}>
              {policy.flag === 'prohibited'
                ? 'This category falls outside what we recommend Claude be deployed for. See the assessment section for reasoning.'
                : 'This category requires additional safeguards. Each recommendation specifies the required human review.'}
            </div>
          </div>
        )}
      </section>

      {/* Thesis */}
      {!isNotNow && thesis_statement && (
        <section
          className="pitch-section fade-in"
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div className="micro-label" style={{ marginBottom: 24 }}>
            02 · Thesis
          </div>
          <p
            className="serif"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 52px)',
              lineHeight: 1.2,
              fontWeight: 400,
              margin: 0,
              letterSpacing: '-0.01em',
              maxWidth: 1000,
              color: TOKENS.ink,
            }}
          >
            {thesis_statement}
          </p>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: TOKENS.inkTertiary,
              marginTop: 32,
              letterSpacing: '0.05em',
            }}
          >
            SUBJECT TO VALIDATION AGAINST YOUR TEAM&apos;S ACTUAL WORKFLOWS.
          </div>
        </section>
      )}

      {/* Workflow overview */}
      {!isNotNow && recommendations && recommendations.length > 0 && (
        <section className="pitch-section fade-in">
          <div className="micro-label" style={{ marginBottom: 16 }}>
            03 · Recommended workflows
          </div>
          <h2
            className="serif"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.1,
              fontWeight: 400,
              margin: '0 0 56px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Where the leverage is.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 1,
              background: TOKENS.border,
              border: `1px solid ${TOKENS.border}`,
            }}
          >
            {recommendations.map((rec, i) => (
              <a
                key={i}
                href={`#workflow-${i}`}
                style={{
                  padding: '32px 28px',
                  background: TOKENS.surface,
                  textDecoration: 'none',
                  color: TOKENS.ink,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'background 0.15s',
                }}
              >
                <div
                  className="mono"
                  style={{ fontSize: 11, color: TOKENS.inkTertiary, letterSpacing: '0.08em' }}
                >
                  WORKFLOW {String(i + 1).padStart(2, '0')}
                </div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1.2 }}>
                  {rec.workflow_name}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: TOKENS.inkSecondary,
                    flex: 1,
                  }}
                >
                  {rec.workflow_one_liner}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 16,
                    borderTop: `1px solid ${TOKENS.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}
                  >
                    {rec.expected_lift?.estimate || ''}
                  </div>
                  <ChevronRight size={16} color={TOKENS.inkTertiary} />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Workflow details */}
      {!isNotNow &&
        recommendations &&
        recommendations.map((rec, i) => <WorkflowDetail key={i} rec={rec} index={i} />)}

      {/* Strategic exclusions */}
      {strategic_exclusions && strategic_exclusions.length > 0 && (
        <section
          className="pitch-section fade-in"
          style={{ background: TOKENS.surface, maxWidth: 'none' }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: 0 }}>
            <div className="micro-label" style={{ marginBottom: 16 }}>
              {isNotNow ? '02' : '04'} · Strategic exclusions
            </div>
            <h2
              className="serif"
              style={{
                fontSize: 'clamp(36px, 5vw, 56px)',
                lineHeight: 1.1,
                fontWeight: 400,
                margin: '0 0 32px 0',
                letterSpacing: '-0.02em',
              }}
            >
              What we chose not to touch.
            </h2>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.6,
                color: TOKENS.inkSecondary,
                maxWidth: 720,
                marginBottom: 64,
              }}
            >
              These are workflows where your team&apos;s expertise creates the business&apos;s
              value. Compressing them with AI would make the business worse, not better.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                borderTop: `1px solid ${TOKENS.border}`,
              }}
            >
              {strategic_exclusions.map((excl, i) => (
                <div
                  key={i}
                  style={{
                    padding: '32px 0',
                    borderBottom: `1px solid ${TOKENS.border}`,
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: 32,
                  }}
                >
                  <div>
                    <div
                      className="serif"
                      style={{ fontSize: 26, lineHeight: 1.2, marginBottom: 12 }}
                    >
                      {excl.workflow_name}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        color: 'var(--accent)',
                      }}
                    >
                      {excl.category.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, lineHeight: 1.6, color: TOKENS.ink }}>
                    {excl.reasoning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Honest assessment */}
      <section className="pitch-section fade-in">
        <div className="micro-label" style={{ marginBottom: 16 }}>
          {isNotNow ? '03' : '05'} · Honest assessment
        </div>
        <div style={{ borderLeft: `3px solid var(--accent)`, paddingLeft: 32, maxWidth: 800 }}>
          <p
            className="serif"
            style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              lineHeight: 1.35,
              fontWeight: 400,
              margin: 0,
              fontStyle: 'italic',
              color: TOKENS.ink,
            }}
          >
            &ldquo;{diagnosis.overall_reasoning}&rdquo;
          </p>
        </div>
      </section>

      {/* Technical appendix */}
      {!isNotNow && recommendations && recommendations.length > 0 && (
        <section className="pitch-section fade-in">
          <div className="micro-label" style={{ marginBottom: 16 }}>
            06 · Technical appendix
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
            For your engineer.
          </h2>
          <p style={{ fontSize: 15, color: TOKENS.inkSecondary, marginBottom: 32 }}>
            Implementation details for each workflow above.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              border: `1px solid ${TOKENS.border}`,
              background: TOKENS.surface,
            }}
          >
            {recommendations.map((rec, i) => (
              <TechnicalAccordion
                key={i}
                rec={rec}
                index={i}
                isLast={i === recommendations.length - 1}
              />
            ))}
          </div>
        </section>
      )}

      {/* Next steps */}
      <section className="pitch-section fade-in">
        <div className="micro-label" style={{ marginBottom: 16 }}>
          {isNotNow ? '04' : '07'} · Next steps
        </div>
        <h2
          className="serif"
          style={{
            fontSize: 'clamp(32px, 4vw, 44px)',
            lineHeight: 1.1,
            fontWeight: 400,
            margin: '0 0 48px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Where to start.
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 32,
          }}
        >
          {[
            {
              title: 'Anthropic Startup Program',
              desc: 'Build credits and direct support for founders building on Claude.',
              href: 'https://www.anthropic.com/startups',
            },
            {
              title: 'Anthropic Academy',
              desc: 'Free courses on Claude 101 and Building with the Claude API.',
              href: 'https://www.anthropic.com/learn',
            },
            {
              title: 'Discuss this proposal',
              desc: 'Reach out directly to discuss implementation specifics.',
              href: 'mailto:nicolas@example.com',
            },
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                borderTop: `1px solid ${TOKENS.border}`,
                paddingTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                className="serif"
                style={{
                  fontSize: 22,
                  lineHeight: 1.25,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                {item.title}
                <ArrowUpRight
                  size={16}
                  style={{ marginTop: 6, color: TOKENS.inkTertiary }}
                />
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: TOKENS.inkSecondary }}>
                {item.desc}
              </div>
            </a>
          ))}
        </div>

        <div
          style={{
            marginTop: 96,
            paddingTop: 48,
            borderTop: `1px solid ${TOKENS.border}`,
            fontSize: 15,
            lineHeight: 1.7,
            color: TOKENS.inkSecondary,
            fontStyle: 'italic',
            maxWidth: 640,
          }}
        >
          Built by Nicolas Tawil. This proposal was generated by Brief, an app designed to
          demonstrate how a thoughtful Solutions Architect translates startup requirements into
          Claude implementations.
        </div>
      </section>

      <footer
        style={{
          padding: '32px 48px',
          borderTop: `1px solid ${TOKENS.border}`,
          background: TOKENS.surface,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: 12,
        }}
      >
        <div className="mono" style={{ color: TOKENS.inkTertiary, maxWidth: 600 }}>
          Generated with Claude. Estimates are conservative by design. Validate against your
          team&apos;s actual workflows.
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
            Usage Policy
          </a>
          <span className="mono" style={{ color: TOKENS.inkTertiary }}>
            Brief by Nicolas Tawil
          </span>
        </div>
      </footer>
    </div>
  );
}
