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
  ExtractedContext,
  IntakeQuestion,
  RecommendationOutput,
  SavedSession,
} from '@/lib/types';

type View = 'landing' | 'intake' | 'generating' | 'pitch';

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
  const [intakeHistory, setIntakeHistory] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<IntakeQuestion | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [extractedContext, setExtractedContext] = useState<ExtractedContext | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationOutput | null>(null);
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
    setIntakeHistory([]);
    setCurrentQuestion(null);
    setExtractedContext(null);
    setRecommendation(null);
    setError(null);
    setGeneratingStatus('');
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

  const startIntake = async (description: string) => {
    setError(null);
    const initialHistory: ChatMessage[] = [
      { role: 'user', content: `Initial business description: ${description}` },
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

      const session: SavedSession = {
        savedAt: Date.now(),
        description: businessDescription,
        history,
        context,
        recommendation: rec,
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
    setIntakeHistory(savedSession.history);
    setExtractedContext(savedSession.context);
    setRecommendation(savedSession.recommendation);
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
          onAnswer={submitAnswer}
          onReset={reset}
        />
      )}

      {view === 'generating' && <GeneratingState status={generatingStatus} />}

      {view === 'pitch' && recommendation && extractedContext && (
        <Pitch
          recommendation={recommendation}
          context={extractedContext}
          onReset={handleResetFromPitch}
        />
      )}
    </div>
  );
}
