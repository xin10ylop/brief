export const CLAUDE_CAPABILITIES = `
MODELS AVAILABLE:
- Opus 4.7: most capable, complex reasoning, high-stakes recommendations, agentic tasks. 200k context.
- Sonnet 4.6: workhorse for long-context analysis, document synthesis, production workflows. 1M context with beta.
- Haiku 4.5: fastest, cheapest, for high-volume classification, extraction, routing. 200k context.

SURFACES (where Claude lives):
- API: programmatic access for embedded productivity in custom software
- Claude Code: terminal and IDE agent for engineering teams
- Cowork: desktop agent for ops teams, founders, sales doing document-heavy work
- Excel add-in: Claude inside Excel with full sheet context for finance and reporting
- PowerPoint add-in: Claude inside decks for sales prep and board materials
- Managed Agents: hosted agent infrastructure with sandboxing and memory
- Bedrock or Vertex: regulated industries needing data residency

PRIMITIVES (building blocks):
- Tool use: function calling, Claude invokes functions you define
- MCP (Model Context Protocol): connects Claude to existing software (CRMs, ticketing, drives, calendars, databases) via standard interface
- Skills: SKILL.md files packaging company-specific knowledge (clause taxonomies, brand voice, workflow templates)
- Subagents: delegate isolated sub-tasks to focused contexts
- Extended thinking: Claude reasons before responding, improves quality on complex problems
- Prompt caching: cache static contexts, major cost reduction for high-volume workflows
- Long context: up to 1M tokens on Sonnet for entire data rooms, codebases, regulatory filings
- Vision: read images, scanned PDFs, visual documents
- Web search and fetch: current information retrieval built in
- Code execution: run Python or Node in sandbox for calculations, data work, file generation
- Memory: persistent context across agent runs in Managed Agents

DELIVERY PATTERNS (how Claude inserts into workflows):
- Drafting assistant: Claude drafts, human reviews and sends. Lowest friction, highest trust.
- Research compression: Claude reads N documents, produces structured brief, human decides
- Triage and routing: Claude classifies inbound, routes high-confidence, escalates ambiguous
- Structured extraction: pull structured data from unstructured input at scale
- Quality gate: Claude reviews work before it goes out, second-pair-of-eyes pattern
- Knowledge retrieval: answer questions over company corpus with citations via MCP
- Workflow acceleration: insert at one or two specific slow steps without changing the workflow shape

EVALUATION APPROACHES:
- Accuracy vs human: sample outputs, senior team member grades agreement, track over time
- Deflection rate: for triage, percentage handled without escalation
- Cycle time: before vs after time-to-completion on the targeted step
- Confidence calibration: when Claude flags high confidence, measure actual accuracy

POLICY CONSTRAINTS:
HIGH-RISK CATEGORIES (require human review of every output, AI disclosure):
legal advice to end users, medical advice to consumers, financial advice to retail consumers without licensed advisor, employment decisions including hiring, credit and lending decisions, insurance coverage decisions

UNIVERSALLY PROHIBITED (refuse to recommend):
weapons design, attacks on critical infrastructure, mass behavioral surveillance and employee monitoring at keystroke or screenshot level, child sexual abuse material, unauthorized vulnerability discovery, election disinformation, automated medical diagnosis for consumers, fully automated credit decisions without human review

CONSUMER CHATBOT RULE: any consumer-facing conversational interface must disclose it is AI at session start.
`.trim();

export const FORBIDDEN_TERMS = [
  'AI employee',
  'replaces',
  'instead of your team',
  'automates away',
  'eliminates the need for',
];
