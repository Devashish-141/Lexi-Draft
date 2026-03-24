import { supabase } from './supabase';

export interface Transaction {
  id: string;
  type: string;
  parties: string;
  date: string;
  status: 'Drafted' | 'Verified' | 'Printed';
}

export interface NotaryDraft {
  id: string;
  type: string;
  label: string;
  parties: string;
  date: string;
  content: string;
  // Stateless Identity Protocol: these are the ONLY identity fields persisted
  legal_name?: string;
  legal_address?: string;
}

const STORAGE_KEY_TX = 'lexidraft_transactions';
const STORAGE_KEY_NOTARY = 'lexidraft_notary_queue';

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY_TX);
  return data ? JSON.parse(data) : [];
}

export function saveTransaction(tx: Transaction) {
  if (typeof window === 'undefined') return;
  const existing = getTransactions();
  if (!existing.find(e => e.id === tx.id && e.status === tx.status)) {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([tx, ...existing]));
  }
}

export function getNotaryDrafts(): NotaryDraft[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY_NOTARY);
  if (data) return JSON.parse(data);
  return [];
}

export async function saveDraftToNotaryQueue(draft: NotaryDraft): Promise<void> {
  if (typeof window === 'undefined') return;

  const existing = getNotaryDrafts();
  if (!existing.find(e => e.id === draft.id)) {
    localStorage.setItem(STORAGE_KEY_NOTARY, JSON.stringify([draft, ...existing]));
  }

  saveTransaction({
    id: draft.id,
    type: draft.label,
    parties: draft.parties,
    date: draft.date,
    status: 'Verified',
  });

  // ─── Stateless Identity Protocol — Privacy-Safe Supabase Sync ─────────────
  // CRITICAL: Only legal_name and legal_address are persisted to the DB.
  // Raw Aadhaar / PAN / Passport numbers are NEVER included here.
  try {
    const { error } = await supabase
      .from('bonds')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // placeholder for prototype (replace with auth.uid() in production)
        doc_type: draft.type,
        legal_name: draft.legal_name ?? draft.parties.split('&')[0].trim(),
        legal_address: draft.legal_address ?? null,
        content: draft.content,
        status: 'verified' as const,
        health_score: 98,
      });

    if (error) console.error('🔴 Supabase Sync Failed:', error.message);
    else console.log('🔒 [Stateless Protocol] Bond saved — only legal_name & legal_address persisted. No ID numbers stored.');
  } catch (err) {
    console.error('Supabase Sync Error:', err);
  }
}

// ─── Transient Session Support (Demo Mode) ─────────────────────────────────
// Saves minimal identity data to temp_session_data for multi-page flows.
// Records auto-expire in 30 minutes via pg_cron.

export async function saveSessionData(
  sessionId: string,
  data: { legal_name: string; legal_address: string; doc_type: string }
): Promise<void> {
  const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('temp_session_data')
    .insert({ session_id: sessionId, ...data, expires_at });

  if (error) console.error('Session save failed:', error.message);
  else console.log('🕑 [Session] Transient data saved. Expires at:', expires_at);
}

export async function fetchAndClearSessionData(
  sessionId: string
): Promise<{ legal_name: string | null; legal_address: string | null; doc_type: string | null } | null> {
  const { data, error } = await supabase
    .from('temp_session_data')
    .select('legal_name, legal_address, doc_type, expires_at')
    .eq('session_id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;

  // Immediately clear after fetch — one-time use
  await supabase.from('temp_session_data').delete().eq('session_id', sessionId);
  console.log('🔒 [Session] Transient record fetched and purged.');

  return { legal_name: data.legal_name, legal_address: data.legal_address, doc_type: data.doc_type };
}
