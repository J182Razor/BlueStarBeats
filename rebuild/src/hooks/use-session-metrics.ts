"use client";

import { useLocalStorageState } from "@/hooks/use-local-storage-state";

interface SessionMetrics {
  totalSessions: number;
  currentStreak: number;
}

const METRICS_STORAGE_KEY = "bsb_session_metrics";

export function useSessionMetrics() {
  const [metrics, setMetrics, hydrated] = useLocalStorageState<SessionMetrics>(METRICS_STORAGE_KEY, {
    totalSessions: 0,
    currentStreak: 0,
  });

  function recordCompletedSession() {
    setMetrics((current) => ({
      totalSessions: current.totalSessions + 1,
      currentStreak: current.currentStreak + 1,
    }));
  }

  return {
    metrics,
    recordCompletedSession,
    hydrated,
  };
}
