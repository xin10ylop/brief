'use client';

import { useEffect, useState } from 'react';
import { Landing } from '@/components/Landing';
import { AreaSelection } from '@/components/AreaSelection';
import { IntakeFlow } from '@/components/IntakeFlow';
import { GeneratingState } from '@/components/GeneratingState';
import { Pitch } from '@/components/Pitch';
import { ErrorBanner } from '@/components/ErrorBanner';
import { TOKENS } from '@/lib/design/tokens';
import { clearSession, loadSession, saveSession } from '@/lib/storage';
import { labelForArea, CUSTOM_AREA_ID } from '@/lib/areas';
import type {
  ChatMessage,
  ChatTurn,
  ExtractedContext,
  IntakeQuestionResponse,
  RecommendationOutput,
  SavedSession,
} from '@/lib/types';

type View = 'landing' | 'areas' | 'intake' | 'generating' | 'pitch';

const CATCH_ALL_KEY = '__catch_all__';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}

export default function HomePage() {
  const [view, setView] = useState<View>('landing');
  const [businessDescription, setBusinessDescription] = useState('');
  const [selectedAreaLabels, setSelectedAreaLabels] = useState<string[]>([]);
  const [exploredAreas, setExploredAreas] = useState<string[]>([]);
  const [intakeHistory, setIntakeHistory] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<IntakeQuestionResponse | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [extractedContext, setExtractedContext] = useState<ExtractedContext | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationOutput | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (s) setSavedSession(s);
  }, []);

  const accentColor = extractedContext?.accent_color_hex || TOKENS.defaultAccent;

  const reset = () => {
    setView('landing');
    setBusinessDescription('');
    setSelectedAreaLabels([]);
    setExploredAreas([]);
    setIntakeHistory([]);
    setCurrentQuestion(null);
    setExtractedContext(null);
    setRecommendation(null);
    setChat([]);
    setError(null);
    setGeneratingStatus('');
  };

  const startAreaSelection = (description: string) => {
    setError(null);
    setBusinessDescription(description);
    setView('areas');
  };

  const fetchOrFinish = async (
    history: ChatMessage[],
    selectedLabels: string[],
    explored: string[],
  ) => {
    const nextArea = selectedLabels.find((label) => !explored.includes(label)) ?? null;
    const catchAllDone = explored.includes(CATCH_ALL_KEY);

    if (nextArea === null && catchAllDone) {
      await runExtractionAndRecommendation(history);
      return;
    }

    setQuestionLoading(true);
    try {
      const phase = nextArea === null ? 'catch_all' : 'area_question';
      const parsed = await postJson<IntakeQuestionResponse>('/api/intake-question', {
        history,
        selected_areas: selectedLabels,
        explored_areas: explored,
        current_area: nextArea,
        phase,
      });
      setCurrentQuestion(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setQuestionLoading(false);
    }
  };

  const startIntake = async (areaIds: string[], customText?: string) => {
    const labels = areaIds.map((id) => labelForArea(id));
    setSelectedAreaLabels(labels);
    setExploredAreas([]);
    const customLine =
      areaIds.includes(CUSTOM_AREA_ID) && customText
        ? `\n\nCustom idea from the user: ${customText}`
        : '';
    const initialHistory: ChatMessage[] = [
      {
        role: 'user',
        content: `Initial business description: ${businessDescription}\n\nAreas selected for exploration (in this order): ${labels.join(
          ', ',
        )}${customLine}`,
      },
    ];
    setIntakeHistory(initialHistory);
    setView('intake');
    await fetchOrFinish(initialHistory, labels, []);
  };

  const submitAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    const justExplored = currentQuestion.area;
    const newHistory: ChatMessage[] = [
      ...intakeHistory,
      { role: 'assistant', content: JSON.stringify(currentQuestion) },
      { role: 'user', content: answer },
    ];
    const newExplored = exploredAreas.includes(justExplored)
      ? exploredAreas
      : [...exploredAreas, justExplored];

    setIntakeHistory(newHistory);
    setExploredAreas(newExplored);
    setCurrentQuestion(null);
    await fetchOrFinish(newHistory, selectedAreaLabels, newExplored);
  };

  const runExtractionAndRecommendation = async (history: ChatMessage[]) => {
    setView('generating');
    setError(null);
    try {
      setGeneratingStatus('Reading the conversation');
      const context = await postJson<ExtractedContext>('/api/extract-context', { history });
      setExtractedContext(context);

      setGeneratingStatus('Identifying productivity leverage points');
      await new Promise((r) => setTimeout(r, 400));
      setGeneratingStatus('Pressure-testing each recommendation');

      const rec = await postJson<RecommendationOutput>('/api/recommend', { context });

      setGeneratingStatus('Drafting your proposal');
      await new Promise((r) => setTimeout(r, 400));
      setRecommendation(rec);
      setChat([]);

      const session: SavedSession = {
        savedAt: Date.now(),
        description: businessDescription,
        selectedAreas: selectedAreaLabels,
        history,
        context,
        recommendation: rec,
        chat: [],
      };
      saveSession(session);
      setSavedSession(session);

      setView('pitch');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setView('intake');
    }
  };

  const handleResume = () => {
    if (!savedSession) return;
    setBusinessDescription(savedSession.description);
    setSelectedAreaLabels(savedSession.selectedAreas || []);
    setIntakeHistory(savedSession.history);
    setExtractedContext(savedSession.context);
    setRecommendation(savedSession.recommendation);
    setChat(savedSession.chat || []);
    setView('pitch');
  };

  const handleDiscardSaved = () => {
    clearSession();
    setSavedSession(null);
  };

  const handleResetFromPitch = () => {
    clearSession();
    setSavedSession(null);
    reset();
  };

  const handleChatUpdate = (next: ChatTurn[]) => {
    setChat(next);
    if (recommendation && extractedContext) {
      const session: SavedSession = {
        savedAt: Date.now(),
        description: businessDescription,
        selectedAreas: selectedAreaLabels,
        history: intakeHistory,
        context: extractedContext,
        recommendation,
        chat: next,
      };
      saveSession(session);
      setSavedSession(session);
    }
  };

  return (
    <div style={{ ['--accent' as string]: accentColor } as React.CSSProperties}>
      {error && <ErrorBanner error={error} onDismiss={() => setError(null)} />}

      {view === 'landing' && (
        <Landing
          description={businessDescription}
          setDescription={setBusinessDescription}
          onSubmit={startAreaSelection}
          savedSession={savedSession}
          onResume={handleResume}
          onDiscardSaved={handleDiscardSaved}
        />
      )}

      {view === 'areas' && (
        <AreaSelection
          description={businessDescription}
          onSubmit={startIntake}
          onReset={reset}
        />
      )}

      {view === 'intake' && (
        <IntakeFlow
          history={intakeHistory}
          currentQuestion={currentQuestion}
          loading={questionLoading}
          selectedAreas={selectedAreaLabels}
          exploredAreas={exploredAreas}
          catchAllKey={CATCH_ALL_KEY}
          onAnswer={submitAnswer}
          onReset={reset}
        />
      )}

      {view === 'generating' && <GeneratingState status={generatingStatus} />}

      {view === 'pitch' && recommendation && extractedContext && (
        <Pitch
          recommendation={recommendation}
          context={extractedContext}
          chat={chat}
          onChatUpdate={handleChatUpdate}
          onReset={handleResetFromPitch}
        />
      )}
    </div>
  );
}
