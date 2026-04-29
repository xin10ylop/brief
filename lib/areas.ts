export const AREAS: { id: string; label: string; helper: string }[] = [
  {
    id: 'customer_support',
    label: 'Customer support and communications',
    helper: 'Inbound queries, ticket triage, response drafting',
  },
  {
    id: 'document_review',
    label: 'Document review and contracts',
    helper: 'Redlines, clause extraction, comparison against playbooks',
  },
  {
    id: 'sales_prep',
    label: 'Sales preparation and outreach',
    helper: 'Account research, call prep, follow-up drafting',
  },
  {
    id: 'finance_reporting',
    label: 'Finance and reporting',
    helper: 'Reconciliation, variance commentary, board materials',
  },
  {
    id: 'inventory_ops',
    label: 'Inventory and operations',
    helper: 'Replenishment notes, supplier comms, exception handling',
  },
  {
    id: 'marketing_content',
    label: 'Marketing and social media content',
    helper: 'Drafting, repurposing, voice consistency',
  },
  {
    id: 'analytics_bi',
    label: 'Analytics and business intelligence',
    helper: 'Question to query, narrative summaries of data',
  },
  {
    id: 'hr_recruiting',
    label: 'HR and recruiting',
    helper: 'Job description drafting, candidate screening assistance',
  },
  {
    id: 'legal_compliance',
    label: 'Legal and compliance',
    helper: 'Policy review, regulatory tracking, first-pass analysis',
  },
  {
    id: 'product_research',
    label: 'Product research and competitive analysis',
    helper: 'Market scans, feature comparisons, user research synthesis',
  },
  {
    id: 'engineering',
    label: 'Code and engineering productivity',
    helper: 'Reviews, refactors, doc generation, scaffolding',
  },
  {
    id: 'knowledge_base',
    label: 'Internal knowledge base and search',
    helper: 'Answer questions over your docs, with citations',
  },
  {
    id: 'meeting_notes',
    label: 'Meeting notes and action items',
    helper: 'Summaries, decision logs, follow-up tracking',
  },
  {
    id: 'email_calendar',
    label: 'Email and calendar management',
    helper: 'Drafting, triage, scheduling logistics',
  },
  {
    id: 'customer_onboarding',
    label: 'Customer onboarding',
    helper: 'Setup checklists, tailored guides, milestone tracking',
  },
  {
    id: 'data_extraction',
    label: 'Data extraction and processing',
    helper: 'Pull structured data from PDFs, emails, forms at scale',
  },
];

export const CUSTOM_AREA_ID = 'custom';

export function labelForArea(id: string): string {
  if (id === CUSTOM_AREA_ID) return 'Something I have in mind';
  const a = AREAS.find((x) => x.id === id);
  return a ? a.label : id;
}
