import React, { useState } from 'react';
import { GoalType } from '../lib/sessionProtocols';

interface OnboardingProps {
  onGoalSelected: (goal: GoalType) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onGoalSelected }) => {
  const [hoveredGoal, setHoveredGoal] = useState<GoalType | null>(null);

  const goals: { type: GoalType; emoji: string; title: string; description: string; gradient: string }[] = [
    {
      type: 'sleep',
      emoji: '😴',
      title: 'Sleep Better',
      description: 'Fall asleep faster and achieve deeper, more restorative sleep with Delta wave entrainment',
      gradient: 'from-indigo-600 to-purple-700'
    },
    {
      type: 'anxiety',
      emoji: '😌',
      title: 'Reduce Stress & Anxiety',
      description: 'Find calm and peace in minutes with scientifically-proven Alpha frequencies',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      type: 'focus',
      emoji: '🧠',
      title: 'Improve Focus',
      description: 'Enhance concentration and enter flow states for peak productivity with Beta waves',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      type: 'meditation',
      emoji: '🧘',
      title: 'Deepen My Meditation',
      description: 'Achieve deeper meditative states with pure Theta brainwave entrainment',
      gradient: 'from-teal-600 to-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-main-gradient relative flex items-center justify-center p-4 overflow-hidden">
      {/* Enhanced Starry Night Sky Background */}
      <div className="starry-night"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-5xl w-full relative z-10 animate-fade-in">
        {/* Welcome Section - Premium Design */}
        <div className="text-center mb-16">
          <div className="logo-container mb-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <img 
              src="/logo-main.png" 
              alt="Blue Star Beats - Precision Brainwave Entrainment" 
              className="h-32 md:h-40 w-auto filter drop-shadow-2xl mx-auto animate-float"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <span className="text-gradient">Tune Your Mind</span>
            <br />
            <span className="text-white">Unlock Your Potential</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-medium tracking-wide mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            Let's personalize your journey. What's your primary goal?
          </p>
        </div>

        {/* Goal Selection - Premium Card Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {goals.map((goal, index) => (
            <button
              key={goal.type}
              onClick={() => onGoalSelected(goal.type)}
              onMouseEnter={() => setHoveredGoal(goal.type)}
              onMouseLeave={() => setHoveredGoal(null)}
              className={`
                group relative
                card-premium p-8 text-left
                transition-all duration-500 ease-out
                overflow-hidden
                animate-slide-up
                ${hoveredGoal === goal.type 
                  ? 'scale-105 shadow-2xl border-purple-400/50' 
                  : 'hover:scale-[1.02]'
                }
              `}
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${goal.gradient}
                opacity-0 group-hover:opacity-10
                transition-opacity duration-500
              `} />
              
              {/* Shine effect */}
              <div className="
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                -translate-x-full group-hover:translate-x-full
                transition-transform duration-1000
              " />
              
              <div className="relative z-10 flex items-start gap-6">
                {/* Emoji with glow effect */}
                <div className={`
                  text-6xl transition-transform duration-300
                  ${hoveredGoal === goal.type ? 'scale-125 rotate-12' : ''}
                  filter drop-shadow-lg
                `}>
                  {goal.emoji}
                </div>
                
                <div className="flex-1">
                  <h3 className="
                    text-2xl md:text-3xl font-bold mb-3
                    transition-colors duration-300
                    ${hoveredGoal === goal.type 
                      ? 'text-gradient' 
                      : 'text-white'
                    }
                  ">
                    {goal.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-base md:text-lg">
                    {goal.description}
                  </p>
                </div>
                
                {/* Arrow icon with animation */}
                <div className={`
                  flex items-center justify-center
                  w-10 h-10 rounded-full
                  bg-gradient-to-br from-purple-600 to-blue-600
                  transition-all duration-300
                  ${hoveredGoal === goal.type 
                    ? 'translate-x-0 opacity-100 scale-110' 
                    : 'translate-x-2 opacity-0 scale-90'
                  }
                `}>
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Bottom accent line */}
              <div className={`
                absolute bottom-0 left-0 right-0 h-1
                bg-gradient-to-r ${goal.gradient}
                transform scale-x-0 group-hover:scale-x-100
                transition-transform duration-500 origin-left
              `} />
            </button>
          ))}
        </div>

        {/* Info Section - Premium Design */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 backdrop-blur-md rounded-full border border-gray-700/50">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <p className="text-gray-300 text-sm md:text-base">
              Choose your goal to get started with a personalized session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
