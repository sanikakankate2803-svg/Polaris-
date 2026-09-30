import type { Match, MatchStatus } from '@/types/database';
import { getProblemStatementById } from '@/lib/problem-statements-store';
import { getAllStartups } from '@/lib/startups-store';
import { computeMatches } from '@/lib/matching-engine';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';

const LOCAL_STORAGE_MATCHES_KEY = 'polaris_matches_registry';

interface MatchStatusOverride {
  matchId: string;
  status: MatchStatus;
  updatedAt: string;
}

function getStoredOverrides(): Record<string, MatchStatusOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MATCHES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getMatchesForProblem(problemId: string): Match[] {
  const problem = getProblemStatementById(problemId);
  if (!problem) return [];

  const startups = getAllStartups();
  const baseMatches = computeMatches(problem, startups);
  const overrides = getStoredOverrides();

  // Merge status overrides
  return baseMatches.map(m => {
    if (overrides[m.id]) {
      return {
        ...m,
        status: overrides[m.id].status,
      };
    }
    return m;
  });
}

export async function updateMatchStatus(
  matchId: string,
  newStatus: MatchStatus,
  matchData?: Match
): Promise<boolean> {
  // Live Supabase update if configured
  if (isSupabaseConfigured() && matchData) {
    try {
      const supabase = createClient();
      const payload = {
        id: matchData.id,
        problem_statement_id: matchData.problem_statement_id,
        startup_id: matchData.startup_id,
        relevance_score: matchData.relevance_score,
        eligibility_breakdown: matchData.eligibility_breakdown,
        match_explanation: matchData.match_explanation,
        status: newStatus,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('matches') as any).upsert(payload);
    } catch (err) {
      console.warn('Supabase match status update failed, saving locally:', err);
    }
  }

  // Local storage persistence
  try {
    const overrides = getStoredOverrides();
    overrides[matchId] = {
      matchId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_MATCHES_KEY, JSON.stringify(overrides));
    return true;
  } catch {
    return false;
  }
}
