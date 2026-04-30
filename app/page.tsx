'use client';

import { useEffect, useState } from 'react';
import { Landing } from '@/components/Landing';
import { IntakeFlow } from '@/components/IntakeFlow';
import { GeneratingState } from '@/components/GeneratingState';
import { Pitch } from '@/components/Pitch';
import { ErrorBanner } from '@/components/ErrorBanner';
import { TOKENS } from '@/lib/design/tokens';
import { clearSession, loadSession, saveSession } from '@/lib/storage';
import type {
  ChatMessage,
  ChatTurn,
  ExtractedContext,
  IntakePhase,
  IntakeQuestionResponse,
  RecommendationOutput,
  SavedSession,
} from '@/lib/types';

type View = 'landing' | 'intake' | 'generating' | 'pitch';

const CATCH_ALL_KEY = '__catch_all__';
const OPENING_TURNS_BEFORE_AREA_SELECTION = 2;

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

function parseAreaSelectionAnswer(answer: string): string[] {
  const cleaned = answer.replace(/\s*\(specifically:[^)]*\)\s*$/i, '');
  const customMatch = answer.match(/\(specifically:\s*([^)]+)\)/i);
  const baseAreas = cleaned
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => !/^something else$/i.test(s) && !/^other$/i.test(s));
  if (customMatch) {
    const custom = customMatch[1].trim();
    if (custom) baseAreas.push(custom);
  }
  return baseAreas;
}

export default function HomePage() {
  const [view, setView] = useState<View>('landing');
  const [businessDescription, setBusinessDescription] = useState('');

  const [phase, setPhase] = useState<IntakePhase>('opening');
  const [openingTurn, setOpeningTurn] = useState(1);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
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
    setPhase('opening');
    setOpeningTurn(1);
    setSelectedAreas([]);
    setExploredAreas([]);
    setIntakeHistory([]);
    setCurrentQuestion(null);
    setExtractedContext(null);
    setRecommendation(null);
    setChat([]);
    setError(null);
    setGeneratingStatus('');
  };

  const fetchQuestion = async (args: {
    history: ChatMessage[];
    phase: IntakePhase;
    openingTurn?: number;
    selectedAreas: string[];
    exploredAreas: string[];
    currentArea: string | null;
  }) => {
    setQuestionLoading(true);
    try {
      const parsed = await postJson<IntakeQuestionResponse>('/api/intake-question', {
        history: args.history,
        phase: args.phase,
        opening_turn: args.openingTurn,
        selected_areas: args.selectedAreas,
        explored_areas: args.exploredAreas,
        current_area: args.currentArea,
      });
      setCurrentQuestion(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setQuestionLoading(false);
    }
  };

  const startIntake = async (description: string) => {
    setError(null);
    setBusinessDescription(description);
    setPhase('opening');
    setOpeningTurn(1);
    setSelectedAreas([]);
    setExploredAreas([]);

    const initialHistory: ChatMessage[] = [
      { role: 'user', content: `Initial business description: ${description}` },
    ];
    setIntakeHistory(initialHistory);
    setView('intake');
    await fetchQuestion({
      history: initialHistory,
      phase: 'opening',
      openingTurn: 1,
      selectedAreas: [],
      exploredAreas: [],
      currentArea: null,
    });
  };

  const submitAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    const newHistory: ChatMessage[] = [
      ...intakeHistory,
      { role: 'assistant', content: JSON.stringify(currentQuestion) },
      { role: 'user', content: answer },
    ];
    setIntakeHistory(newHistory);
    setCurrentQuestion(null);

    if (phase === 'opening') {
      const justAnswered = openingTurn;
      if (justAnswered < OPENING_TURNS_BEFORE_AREA_SELECTION) {
        const nextTurn = justAnswered + 1;
        setOpeningTurn(nextTurn);
        await fetchQuestion({
          history: newHistory,
          phase: 'opening',
          openingTurn: nextTurn,
          selectedAreas,
          exploredAreas,
          currentArea: null,
        });
      } else {
        setPhase('area_selection');
        await fetchQuestion({
          history: newHistory,
          phase: 'area_selection',
          selectedAreas,
          exploredAreas,
          currentArea: null,
        });
      }
      return;
    }

    if (phase === 'area_selection') {
      const picked = parseAreaSelectionAnswer(answer);
      if (picked.length === 0) {
        setError('Please pick at least one area to explore.');
        return;
      }
      setSelectedAreas(picked);
      setPhase('area_question');
      const first = picked[0];
      await fetchQuestion({
        history: newHistory,
        phase: 'area_question',
        selectedAreas: picked,
        exploredAreas: [],
        currentArea: first,
      });
      return;
    }

    if (phase === 'area_question') {
      const justExplored = currentQuestion.area;
      const newExplored = exploredAreas.includes(justExplored)
        ? exploredAreas
        : [...exploredAreas, justExplored];
      setExploredAreas(newExplored);

      const remaining = selectedAreas.find((a) => !newExplored.includes(a));
      if (remaining) {
        await fetchQuestion({
          history: newHistory,
          phase: 'area_question',
          selectedAreas,
          exploredAreas: newExplored,
          currentArea: remaining,
        });
      } else {
        setPhase('catch_all');
        await fetchQuestion({
          history: newHistory,
          phase: 'catch_all',
          selectedAreas,
          exploredAreas: newExplored,
          currentArea: null,
        });
      }
      return;
    }

    if (phase === 'catch_all') {
      const newExplored = exploredAreas.includes(CATCH_ALL_KEY)
        ? exploredAreas
        : [...exploredAreas, CATCH_ALL_KEY];
      setExploredAreas(newExplored);
      await runExtractionAndRecommendation(newHistory);
    }
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
        selectedAreas,
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
    setSelectedAreas(savedSession.selectedAreas || []);
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
        selectedAreas,
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
          onSubmit={startIntake}
          savedSession={savedSession}
          onResume={handleResume}
          onDiscardSaved={handleDiscardSaved}
        />
      )}

      {view === 'intake' && (
        <IntakeFlow
          history={intakeHistory}
          currentQuestion={currentQuestion}
          loading={questionLoading}
          phase={phase}
          selectedAreas={selectedAreas}
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
