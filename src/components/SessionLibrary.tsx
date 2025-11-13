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
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const isPremium = premiumService.isPremium();

  const allSessions = selectedGoal 
    ? getSessionsByGoal(selectedGoal, isPremium)
    : getFreeSessions();

  const goals: { type: GoalType; emoji: string; title: string; color: string }[] = [
    { type: 'sleep', emoji: '😴', title: 'Sleep', color: 'from-indigo-600 to-purple-700' },
    { type: 'anxiety', emoji: '😌', title: 'Anxiety & Stress', color: 'from-blue-500 to-cyan-600' },
    { type: 'focus', emoji: '🧠', title: 'Focus', color: 'from-purple-600 to-pink-600' },
    { type: 'meditation', emoji: '🧘', title: 'Meditation', color: 'from-teal-600 to-emerald-600' }
  ];

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="glass-elevated max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Premium Design */}
        <button
          onClick={onClose}
          className="
            absolute top-6 right-6
            w-10 h-10 rounded-full
            bg-gray-800/50 hover:bg-gray-700/50
            backdrop-blur-sm
            border border-gray-700/50
            flex items-center justify-center
            text-gray-400 hover:text-white
            transition-all duration-300
            hover:scale-110 hover:rotate-90
            group
          "
          aria-label="Close"
        >
          <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header - Premium Design */}
        <div className="mb-10 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="text-gradient">Session Library</span>
          </h2>
          <p className="text-gray-300 text-lg">Choose a session to begin your brainwave entrainment journey</p>
        </div>

        {/* Goal Filter - Premium Design */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedGoal(null)}
              className={`
                px-6 py-3 rounded-full
                font-semibold text-sm
                transition-all duration-300
                ${selectedGoal === null
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
                }
              `}
            >
              All Sessions
            </button>
            {goals.map((g) => (
              <button
                key={g.type}
                onClick={() => setSelectedGoal(g.type)}
                className={`
                  px-6 py-3 rounded-full
                  font-semibold text-sm
                  transition-all duration-300
                  flex items-center gap-2
                  ${selectedGoal === g.type
                    ? `bg-gradient-to-r ${g.color} text-white shadow-lg scale-105`
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
                  }
                `}
              >
                <span className="text-lg">{g.emoji}</span>
                {g.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List - Premium Card Design */}
        <div className="space-y-4">
          {allSessions.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 mb-2 text-lg">No sessions available for this filter.</p>
              {!isPremium && (
                <p className="text-sm text-gray-500">
                  Upgrade to Premium to unlock all sessions
                </p>
              )}
            </div>
          ) : (
            allSessions.map((session, index) => (
              <div
                key={session.id}
                onMouseEnter={() => setHoveredSession(session.id)}
                onMouseLeave={() => setHoveredSession(null)}
                className={`
                  card-premium p-6
                  transition-all duration-500
                  group
                  animate-slide-up
                  ${hoveredSession === session.id 
                    ? 'border-purple-400/50 shadow-2xl scale-[1.02]' 
                    : ''
                  }
                `}
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                {/* Gradient overlay on hover */}
                <div className="
                  absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-500
                  rounded-xl
                " />
                
                <div className="relative z-10 flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-white group-hover:text-gradient transition-colors duration-300">
                        {session.name}
                      </h3>
                      {session.isPremium && (
                        <span className="
                          px-3 py-1
                          bg-gradient-to-r from-yellow-500 to-yellow-600
                          text-white text-xs font-bold
                          rounded-full
                          shadow-lg shadow-yellow-500/50
                          animate-pulse
                        ">
                          ⭐ PREMIUM
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-5 leading-relaxed text-base">
                      {session.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {session.lengths.map((length) => (
                        <button
                          key={length}
                          onClick={() => onSessionSelect(session, length)}
                          className="
                            px-5 py-2.5
                            bg-gradient-to-r from-blue-600/20 to-purple-600/20
                            hover:from-blue-600/40 hover:to-purple-600/40
                            text-blue-300 hover:text-white
                            rounded-lg
                            transition-all duration-300
                            font-semibold
                            border border-blue-500/30 hover:border-blue-400/50
                            transform hover:scale-105
                            shadow-lg hover:shadow-xl
                          "
                        >
                          {formatTime(length)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className={`
                    flex items-center justify-center
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-purple-600 to-blue-600
                    transition-all duration-300
                    ${hoveredSession === session.id 
                      ? 'translate-x-0 opacity-100 scale-110 rotate-0' 
                      : 'translate-x-2 opacity-0 scale-90 -rotate-45'
                    }
                  `}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Premium CTA - Enhanced Design */}
        {!isPremium && (
          <div className="mt-10 p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4 shadow-lg shadow-yellow-500/50">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Unlock All Sessions</h3>
            <p className="text-gray-300 mb-6 text-lg">
              Get access to 50+ premium sessions, all lengths, and advanced features
            </p>
            <button className="btn-premium text-lg px-8 py-4">
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionLibrary;
