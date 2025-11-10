import React from 'react';
import { GoalType } from '../lib/sessionProtocols';

interface OnboardingProps {
  onGoalSelected: (goal: GoalType) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onGoalSelected }) => {
  const goals: { type: GoalType; emoji: string; title: string; description: string }[] = [
    {
      type: 'sleep',
      emoji: '😴',
      title: 'Sleep Better',
      description: 'Fall asleep faster and achieve deeper, more restorative sleep'
    },
    {
      type: 'anxiety',
      emoji: '😌',
      title: 'Reduce Stress & Anxiety',
      description: 'Find calm and peace in minutes with scientifically-proven frequencies'
    },
    {
      type: 'focus',
      emoji: '🧠',
      title: 'Improve Focus',
      description: 'Enhance concentration and enter flow states for peak productivity'
    },
    {
      type: 'meditation',
      emoji: '🧘',
      title: 'Deepen My Meditation',
      description: 'Achieve deeper meditative states with pure brainwave entrainment'
    }
  ];

  return (
    <div className="min-h-screen bg-main-gradient flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="logo-container mb-6">
            <img 
              src="/logo-main.png" 
              alt="Blue Star Beats Logo" 
              className="h-20 w-auto filter drop-shadow-lg mx-auto"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="text-brand-blue">Welcome to</span>{' '}
            <span className="text-brand-golden">Blue Star Beats</span>
          </h1>
          <p className="text-xl text-gray-300 font-medium tracking-wide mb-2">
            PRECISION BRAINWAVE ENTRAINMENT
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Let's tune your mind. What's your primary goal?
          </p>
        </div>

        {/* Goal Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {goals.map((goal) => (
            <button
              key={goal.type}
              onClick={() => onGoalSelected(goal.type)}
              className="card-premium p-8 text-left hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">{goal.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-golden transition-colors">
                    {goal.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {goal.description}
                  </p>
                </div>
                <svg 
                  className="w-6 h-6 text-brand-golden opacity-0 group-hover:opacity-100 transition-opacity" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Info Section */}
        <div className="text-center text-gray-400 text-sm">
          <p>Choose your goal to get started with a personalized session</p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

