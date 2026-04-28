import type { SavedSession } from './types';

const STORAGE_KEY = 'brief.session.v1';

export function saveSession(session: SavedSession) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore quota errors
  }
}

export function loadSession(): SavedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
