"use client";

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode
} from 'react';
import { IdentityExtraction } from '@/lib/gemini-handler';

// ─── Stateless Identity Protocol ──────────────────────────────────────────────
// Identity data lives ONLY in React memory.
// It is NEVER written to localStorage, cookies, or any persistent store.
// A unique sessionId (UUID) is held in sessionStorage for cross-page demo flows.
// All state is wiped on: logout, handshake completion, or tab close.
// ──────────────────────────────────────────────────────────────────────────────

interface SessionIdentityContextType {
  identity: IdentityExtraction | null;
  sessionId: string | null;
  setIdentity: (identity: IdentityExtraction | null) => void;
  wipeIdentity: () => void;
  isVerified: boolean;
}

const SessionIdentityContext = createContext<SessionIdentityContextType | undefined>(undefined);

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function SessionIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentityState] = useState<IdentityExtraction | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialise a session ID (persisted in sessionStorage — cleared on tab close by the browser)
  useEffect(() => {
    let id = sessionStorage.getItem('lexi_session_id');
    if (!id) {
      id = generateUUID();
      sessionStorage.setItem('lexi_session_id', id);
    }
    setSessionId(id);
  }, []);

  const wipeIdentity = useCallback(() => {
    setIdentityState(null);
    // Clear the session ID so any temp_session_data row can no longer be fetched
    sessionStorage.removeItem('lexi_session_id');
    const newId = generateUUID();
    sessionStorage.setItem('lexi_session_id', newId);
    setSessionId(newId);
    console.log('🔒 [Stateless Protocol] Identity purged from memory. Session rotated.');
  }, []);

  const setIdentity = useCallback((newIdentity: IdentityExtraction | null) => {
    setIdentityState(newIdentity);
  }, []);

  // Defense-in-depth: wipe on tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => wipeIdentity();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [wipeIdentity]);

  return (
    <SessionIdentityContext.Provider
      value={{
        identity,
        sessionId,
        setIdentity,
        wipeIdentity,
        isVerified: !!identity?.isVerified,
      }}
    >
      {children}
    </SessionIdentityContext.Provider>
  );
}

export function useSessionIdentity() {
  const context = useContext(SessionIdentityContext);
  if (context === undefined) {
    throw new Error('useSessionIdentity must be used within a SessionIdentityProvider');
  }
  return context;
}
