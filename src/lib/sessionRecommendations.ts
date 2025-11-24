import { SessionProtocol, GoalType } from './types';
import { userPreferences } from './userPreferences';
import { premiumService } from './premiumService';
import { SESSION_PROTOCOLS } from './sessionProtocols';

interface UserHistory {
  sessionId: string;
  completionCount: number;
  averageRating: number;
  lastPlayed?: Date;
}

/**
 * Smart recommendation engine for session protocols
 * Considers user preferences, completion rates, and effectiveness
 */
export class SessionRecommendationEngine {
  /**
   * Get recommended sessions based on goal and user history
   */
  static recommendSessions(
    goal: GoalType,
    limit: number = 5
  ): SessionProtocol[] {
    const userHistory = this.getUserHistory();
    const userPrefs = userPreferences.loadPreferences();
    const isPremium = premiumService.isPremium();

    // Filter sessions by goal and premium status
    let candidates = SESSION_PROTOCOLS.filter(
      session => 
        session.goal === goal && 
        (!session.isPremium || isPremium)
    );

    // Score each session
    const scored = candidates.map(session => ({
      session,
      score: this.calculateScore(session, userHistory, userPrefs)
    }));

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);

    // Return top recommendations
    return scored.slice(0, limit).map(item => item.session);
  }

  /**
   * Calculate recommendation score for a session
   */
  private static calculateScore(
    session: SessionProtocol,
    userHistory: UserHistory[],
    userPrefs: ReturnType<typeof userPreferences.loadPreferences>
  ): number {
    let score = 0;

    // Base score from session properties
    score += 10;

    // Boost if it's a favorite
    if (userPrefs.favoriteSessions.includes(session.id)) {
      score += 20;
    }

    // Boost if recently played (user likes it)
    const recentIndex = userPrefs.recentlyPlayed.indexOf(session.id);
    if (recentIndex >= 0) {
      score += 15 - recentIndex; // More recent = higher score
    }

    // Boost based on user history
    const history = userHistory.find(h => h.sessionId === session.id);
    if (history) {
      // Completion rate boost
      score += history.completionCount * 2;
      
      // Rating boost
      if (history.averageRating) {
        score += history.averageRating * 3;
      }

      // Recency boost (sessions played recently get slight boost)
      if (history.lastPlayed) {
        const daysSince = (Date.now() - history.lastPlayed.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
          score += 5;
        }
      }
    } else {
      // New sessions get a small boost to encourage exploration
      score += 3;
    }

    // Premium sessions get slight boost (they're usually more advanced)
    if (session.isPremium) {
      score += 2;
    }

    // Sessions with frequency ramps get boost (more sophisticated)
    if (session.frequencyRamp) {
      score += 3;
    }

    return score;
  }

  /**
   * Get user history aggregated by session
   */
  private static getUserHistory(): UserHistory[] {
    const history = userPreferences.getSessionHistory();
    const aggregated = new Map<string, UserHistory>();

    history.forEach(entry => {
      const existing = aggregated.get(entry.sessionId) || {
        sessionId: entry.sessionId,
        completionCount: 0,
        averageRating: 0,
        lastPlayed: undefined
      };

      if (entry.completed) {
        existing.completionCount++;
      }

      if (entry.effectivenessRating) {
        const currentAvg = existing.averageRating;
        const count = existing.completionCount;
        // Recalculate average
        existing.averageRating = 
          (currentAvg * (count - 1) + entry.effectivenessRating) / count;
      }

      if (!existing.lastPlayed || entry.date > existing.lastPlayed) {
        existing.lastPlayed = entry.date;
      }

      aggregated.set(entry.sessionId, existing);
    });

    return Array.from(aggregated.values());
  }

  /**
   * Get sessions similar to a given session
   */
  static getSimilarSessions(
    sessionId: string,
    limit: number = 5
  ): SessionProtocol[] {
    const session = SESSION_PROTOCOLS.find(s => s.id === sessionId);
    if (!session) return [];

    const isPremium = premiumService.isPremium();

    // Find sessions with similar properties
    const candidates = SESSION_PROTOCOLS
      .filter(s => 
        s.id !== sessionId &&
        (!s.isPremium || isPremium)
      )
      .map(s => ({
        session: s,
        similarity: this.calculateSimilarity(session, s)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.session);

    return candidates;
  }

  /**
   * Calculate similarity between two sessions
   */
  private static calculateSimilarity(
    session1: SessionProtocol,
    session2: SessionProtocol
  ): number {
    let similarity = 0;

    // Same goal
    if (session1.goal === session2.goal) similarity += 30;

    // Similar beat frequency (within 2 Hz)
    const freqDiff = Math.abs(session1.beatFrequency - session2.beatFrequency);
    if (freqDiff <= 2) similarity += 20;
    else if (freqDiff <= 5) similarity += 10;

    // Same mode
    if (session1.mode === session2.mode) similarity += 15;

    // Same waveform
    if (session1.waveform === session2.waveform) similarity += 10;

    // Both have or don't have frequency ramp
    if (!!session1.frequencyRamp === !!session2.frequencyRamp) {
      similarity += 10;
    }

    // Similar carrier frequency (within 50 Hz)
    const carrierDiff = Math.abs(session1.carrierFrequency - session2.carrierFrequency);
    if (carrierDiff <= 50) similarity += 15;

    return similarity;
  }

  /**
   * Get trending sessions (most played recently)
   */
  static getTrendingSessions(limit: number = 5): SessionProtocol[] {
    const history = userPreferences.getSessionHistory();
    const isPremium = premiumService.isPremium();

    // Count plays in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPlays = history
      .filter(entry => entry.date >= sevenDaysAgo)
      .reduce((acc, entry) => {
        acc.set(entry.sessionId, (acc.get(entry.sessionId) || 0) + 1);
        return acc;
      }, new Map<string, number>());

    // Sort by play count
    const sorted = Array.from(recentPlays.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // Get session objects
    return sorted
      .map(([sessionId]) => SESSION_PROTOCOLS.find(s => s.id === sessionId))
      .filter((s): s is SessionProtocol => 
        s !== undefined && (!s.isPremium || isPremium)
      );
  }
}

