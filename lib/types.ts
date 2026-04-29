export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type IntakeQuestion = {
  question_text: string;
  context_acknowledgment?: string;
  input_type: 'open_text' | 'single_select' | 'multi_select';
  options?: string[];
};

export type IntakeQuestionResponse = IntakeQuestion & {
  area: string;
};

export type PolicyFlag = 'none' | 'high_risk' | 'prohibited';

export type ExtractedContext = {
  business_summary: string;
  industry_label: string;
  team_signals: string;
  selected_areas?: string[];
  identified_workflows: string[];
  where_time_is_lost: string;
  ai_maturity: string;
  regulatory_constraints: string;
  user_ideas?: string;
  accent_color_hex: string;
  policy: {
    flag: PolicyFlag;
    reasoning?: string;
  };
};

export type Recommendation = {
  area?: string;
  workflow_name: string;
  workflow_one_liner: string;
  current_state: string;
  insertion_point: {
    step: string;
    what_claude_does: string;
    human_authority: {
      role: string;
      responsibility: string;
    };
    handoff_format: string;
  };
  expected_lift: {
    estimate: string;
    reasoning: string;
  };
  confidence: {
    reliable_for: string;
    will_struggle_with: string;
  };
  technical: {
    surfaces: string[];
    primitives: string[];
    pattern: string;
    integrations: string[];
    complexity: 'small' | 'medium' | 'large';
  };
};

export type RecommendationOutput = {
  diagnosis: {
    business_understanding: string;
    overall_recommendation: 'proceed' | 'proceed_carefully' | 'not_now';
    overall_reasoning: string;
  };
  thesis_statement?: string;
  recommendations: Recommendation[];
  policy: {
    flag: PolicyFlag;
    required_safeguards?: string[];
  };
};

export type ChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export type SavedSession = {
  savedAt: number;
  description: string;
  selectedAreas: string[];
  history: ChatMessage[];
  context: ExtractedContext;
  recommendation: RecommendationOutput;
  chat?: ChatTurn[];
};
