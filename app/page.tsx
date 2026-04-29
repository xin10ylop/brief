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
  IntakeQuestion,
  RecommendationOutput,
  SavedSession,
} from '@/lib/types';

type View = 'landing' | 'areas' | 'intake' | 'generating' | 'pitch';

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
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [intakeHistory, setIntakeHistory] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<IntakeQuestion | null>(null);
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
    setSelectedAreas([]);
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

  const fetchNextQuestion = async (history: ChatMessage[]) => {
    setQuestionLoading(true);
    try {
      const parsed = await postJson<IntakeQuestion>('/api/intake-question', { history });
      if (parsed.is_final) {
        await runExtractionAndRecommendation(history);
      } else {
        setCurrentQuestion(parsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setQuestionLoading(false);
    }
  };

  const startIntake = async (areaIds: string[], customText?: string) => {
    setSelectedAreas(areaIds);
    const labels = areaIds.map((id) => labelForArea(id));
    const customLine =
      areaIds.includes(CUSTOM_AREA_ID) && customText
        ? `\n\nCustom idea from the user: ${customText}`
        : '';
    const initialHistory: ChatMessage[] = [
      {
        role: 'user',
        content: `Initial business description: ${businessDescription}\n\nAreas selected for exploration: ${labels.join(
          ', ',
        )}${customLine}`,
      },
    ];
    setIntakeHistory(initialHistory);
    setView('intake');
    await fetchNextQuestion(initialHistory);
  };

  const submitAnswer = async (answer: string) => {
    if (!currentQuestion || currentQuestion.is_final) return;
    const newHistory: ChatMessage[] = [
      ...intakeHistory,
      { role: 'assistant', content: JSON.stringify(currentQuestion) },
      { role: 'user', content: answer },
    ];
    setIntakeHistory(newHistory);
    setCurrentQuestion(null);
    await fetchNextQuestion(newHistory);
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
