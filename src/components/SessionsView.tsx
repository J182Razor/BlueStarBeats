import React, { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { SESSION_PROTOCOLS, getSessionsByGoal } from '../lib/sessionProtocols';
import { GoalType, SessionLength } from '../lib/sessionProtocols';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { premiumService } from '../lib/premiumService';
import { userPreferences } from '../lib/userPreferences';
import { SessionRecommendationEngine } from '../lib/sessionRecommendations';

const SessionsView: React.FC = () => {
  const { selectSession } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | GoalType>('all');
  const isIOS = Capacitor.getPlatform() === 'ios';
  const isPremium = premiumService.isPremium();

  const categories: Array<'all' | GoalType> = ['all', 'sleep', 'focus', 'meditation', 'anxiety'];

  // Get recommended sessions
  const recommendedSessions = useMemo(() => {
    if (filter !== 'all') {
      return SessionRecommendationEngine.recommendSessions(filter, 3);
    }
    return [];
  }, [filter]);

  const filteredSessions = useMemo(() => {
    let sessions = filter === 'all' 
      ? SESSION_PROTOCOLS.filter(s => !s.isPremium || isPremium)
      : getSessionsByGoal(filter, isPremium);

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sessions = sessions.filter(session =>
        session.name.toLowerCase().includes(query) ||
        session.description.toLowerCase().includes(query)
      );
    }

    return sessions;
  }, [searchQuery, filter, isPremium]);

  const handleSessionSelect = (session: typeof SESSION_PROTOCOLS[0]) => {
    const length = session.lengths[0] || 30;
    selectSession(session, length as SessionLength);
    if (isIOS) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    }
  };

  const favorites = userPreferences.loadPreferences().favoriteSessions;
  const favoriteSessions = SESSION_PROTOCOLS.filter(s => 
    favorites.includes(s.id) && (!s.isPremium || isPremium)
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 p-4 sm:p-6 safe-area-inset">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Sessions</h1>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-lg rounded-xl py-3 px-4 pr-12 text-white placeholder-purple-200 border border-white/20 focus:border-purple-400 focus:outline-none text-sm sm:text-base"
          />
          <div className="absolute right-3 top-3.5 text-purple-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === category
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
              onClick={() => {
                setFilter(category);
                if (isIOS) {
                  Haptics.selectionChanged().catch(() => {});
                }
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Section */}
      {recommendedSessions.length > 0 && filter !== 'all' && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
            <span>✨</span> Recommended for You
          </h2>
          <div className="space-y-2">
            {recommendedSessions.map(session => {
              const stats = userPreferences.getSessionStats(session.id);
              return (
                <div
                  key={session.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-purple-500/30 active:scale-[0.98] transition-transform"
                  onClick={() => handleSessionSelect(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm">{session.name}</h3>
                        {userPreferences.isFavorite(session.id) && (
                          <span className="text-yellow-400 text-xs">⭐</span>
                        )}
                      </div>
                      {stats.count > 0 && (
                        <p className="text-xs text-purple-300">
                          Played {stats.count}x {stats.averageRating && `• ${stats.averageRating.toFixed(1)}⭐`}
                        </p>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {favoriteSessions.length > 0 && filter === 'all' && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
            <span>⭐</span> Favorites
          </h2>
          <div className="space-y-2">
            {favoriteSessions.slice(0, 3).map(session => (
              <div
                key={session.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-yellow-500/30 active:scale-[0.98] transition-transform"
                onClick={() => handleSessionSelect(session)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm">{session.name}</h3>
                    <p className="text-xs text-purple-300 mt-1">{session.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No sessions found</h3>
            <p className="text-purple-200 text-sm">Try adjusting your search or filter</p>
            {!isPremium && (
              <p className="text-purple-300 text-xs mt-2">Upgrade to Premium for more sessions</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map(session => {
              const stats = userPreferences.getSessionStats(session.id);
              return (
                <div
                  key={session.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => handleSessionSelect(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="text-white font-semibold text-base sm:text-lg mr-2">{session.name}</h3>
                        {userPreferences.isFavorite(session.id) && (
                          <span className="text-yellow-400 text-sm">⭐</span>
                        )}
                        {session.isPremium && (
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-xs text-black px-2 py-0.5 rounded-full font-bold ml-2">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-purple-200 text-sm mb-2 line-clamp-2">{session.description}</p>
                      <div className="flex items-center text-xs text-purple-300 flex-wrap gap-2">
                        <span className="capitalize">{session.goal}</span>
                        <span>•</span>
                        <span>{session.lengths.join(', ')} min</span>
                        {stats.count > 0 && (
                          <>
                            <span>•</span>
                            <span>Played {stats.count}x</span>
                            {stats.averageRating && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <span>⭐</span>
                                  {stats.averageRating.toFixed(1)}
                                </span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center ml-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsView;

