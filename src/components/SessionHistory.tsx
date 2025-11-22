import React, { useState, useMemo } from 'react';
import { SessionHistoryEntry } from '../lib/types';
import { userPreferences } from '../lib/userPreferences';
import { getSessionById } from '../lib/sessionProtocols';

interface SessionHistoryProps {
  onClose: () => void;
  onSessionSelect?: (sessionId: string) => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ onClose, onSessionSelect }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'duration'>('date');
  const [selectedEntry, setSelectedEntry] = useState<SessionHistoryEntry | null>(null);

  const history = userPreferences.getSessionHistory();

  const filteredAndSorted = useMemo(() => {
    let filtered = history;

    // Filter
    if (selectedFilter === 'completed') {
      filtered = filtered.filter(entry => entry.completed);
    } else if (selectedFilter === 'incomplete') {
      filtered = filtered.filter(entry => !entry.completed);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.date.getTime() - a.date.getTime();
        case 'rating':
          const aRating = a.effectivenessRating || 0;
          const bRating = b.effectivenessRating || 0;
          return bRating - aRating;
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    return sorted;
  }, [history, selectedFilter, sortBy]);

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const stats = useMemo(() => {
    const completed = history.filter(e => e.completed);
    const totalDuration = completed.reduce((sum, e) => sum + e.duration, 0);
    const ratings = completed
      .map(e => e.effectivenessRating)
      .filter((r): r is number => r !== undefined);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    return {
      totalSessions: history.length,
      completedSessions: completed.length,
      totalDuration,
      averageRating: avgRating,
      completionRate: history.length > 0 ? (completed.length / history.length) * 100 : 0
    };
  }, [history]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-4 pb-24 overflow-y-auto animate-fade-in">
      <div className="glass-elevated max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-90"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">
            <span className="text-gradient">Session History</span>
          </h2>
          <p className="text-gray-400">Track your brainwave entrainment journey</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="glass-card-silver p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-silver-light">{stats.totalSessions}</div>
            <div className="text-xs text-gray-400 mt-1">Total Sessions</div>
          </div>
          <div className="glass-card-silver p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-400">{stats.completedSessions}</div>
            <div className="text-xs text-gray-400 mt-1">Completed</div>
          </div>
          <div className="glass-card-silver p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-400">{formatDuration(stats.totalDuration)}</div>
            <div className="text-xs text-gray-400 mt-1">Total Time</div>
          </div>
          <div className="glass-card-silver p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">Avg Rating</div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {(['all', 'completed', 'incomplete'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === filter
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
          >
            <option value="date">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg">No session history yet</p>
              <p className="text-sm mt-2">Complete a session to see it here</p>
            </div>
          ) : (
            filteredAndSorted.map((entry) => {
              const session = getSessionById(entry.sessionId);
              return (
                <div
                  key={`${entry.sessionId}-${entry.date.getTime()}`}
                  className="card-premium p-4 sm:p-6 rounded-xl hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => {
                    if (entry.notes) {
                      setSelectedEntry(entry);
                    } else if (onSessionSelect) {
                      onSessionSelect(entry.sessionId);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-white text-lg">
                          {session?.name || entry.sessionId}
                        </h3>
                        {entry.completed && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            ✓ Completed
                          </span>
                        )}
                        {entry.effectivenessRating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < entry.effectivenessRating!
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-600 fill-gray-600'
                                }`}
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-2">
                        <span>{formatDate(entry.date)}</span>
                        <span>•</span>
                        <span>{formatDuration(entry.duration)}</span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    {entry.notes && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                        }}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Notes Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-elevated max-w-lg w-full p-6 rounded-2xl relative animate-scale-in">
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-4">
              {getSessionById(selectedEntry.sessionId)?.name || selectedEntry.sessionId}
            </h3>
            {selectedEntry.effectivenessRating && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-400">Rating:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < selectedEntry.effectivenessRating!
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600 fill-gray-600'
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            )}
            <div className="text-sm text-gray-400 mb-4">
              {formatDate(selectedEntry.date)} • {formatDuration(selectedEntry.duration)}
            </div>
            {selectedEntry.notes && (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-white whitespace-pre-wrap">{selectedEntry.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;

