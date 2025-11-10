import React, { useState } from 'react';
import { SessionProtocol, GoalType, SessionLength, getSessionsByGoal, getFreeSessions } from '../lib/sessionProtocols';
import { premiumService } from '../lib/premiumService';

interface SessionLibraryProps {
  goal: GoalType | null;
  onSessionSelect: (session: SessionProtocol, length: SessionLength) => void;
  onClose: () => void;
}

const SessionLibrary: React.FC<SessionLibraryProps> = ({ goal, onSessionSelect, onClose }) => {
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(goal);
  const isPremium = premiumService.isPremium();

  const allSessions = selectedGoal 
    ? getSessionsByGoal(selectedGoal, isPremium)
    : getFreeSessions();

  const goals: { type: GoalType; emoji: string; title: string }[] = [
    { type: 'sleep', emoji: '😴', title: 'Sleep' },
    { type: 'anxiety', emoji: '😌', title: 'Anxiety & Stress' },
    { type: 'focus', emoji: '🧠', title: 'Focus' },
    { type: 'meditation', emoji: '🧘', title: 'Meditation' }
  ];

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="card-premium max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Session Library</h2>
          <p className="text-gray-400">Choose a session to begin your brainwave entrainment journey</p>
        </div>

        {/* Goal Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGoal(null)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedGoal === null
                  ? 'bg-brand-golden text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Sessions
            </button>
            {goals.map((g) => (
              <button
                key={g.type}
                onClick={() => setSelectedGoal(g.type)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedGoal === g.type
                    ? 'bg-brand-golden text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {g.emoji} {g.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {allSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No sessions available for this filter.</p>
              {!isPremium && (
                <p className="text-sm text-gray-500">
                  Upgrade to Premium to unlock all sessions
                </p>
              )}
            </div>
          ) : (
            allSessions.map((session) => (
              <div
                key={session.id}
                className="card-premium p-6 hover:border-brand-golden transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{session.name}</h3>
                      {session.isPremium && (
                        <span className="px-2 py-1 bg-brand-golden/20 text-brand-golden text-xs font-semibold rounded">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-4">{session.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {session.lengths.map((length) => (
                        <button
                          key={length}
                          onClick={() => onSessionSelect(session, length)}
                          className="px-4 py-2 bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue rounded-lg transition-all font-medium"
                        >
                          {formatTime(length)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Premium CTA */}
        {!isPremium && (
          <div className="mt-8 card-highlight p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Unlock All Sessions</h3>
            <p className="text-gray-300 mb-4">
              Get access to 50+ premium sessions, all lengths, and advanced features
            </p>
            <button className="btn-primary">
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionLibrary;

