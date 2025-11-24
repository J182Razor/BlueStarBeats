import React from 'react';
import { Settings, Moon, Target, Flower2, Waves } from 'lucide-react';
import { PlayerBar } from './PlayerBar';

export const Home: React.FC = () => {
    const categories = [
        {
            id: 'sleep',
            title: 'Sleep',
            subtitle: 'Deep Delta Waves',
            icon: Moon,
            color: 'from-indigo-500/20 to-purple-500/20',
            iconColor: 'text-indigo-300'
        },
        {
            id: 'focus',
            title: 'Focus',
            subtitle: '40Hz Gamma',
            icon: Target,
            color: 'from-blue-500/20 to-cyan-500/20',
            iconColor: 'text-blue-300'
        },
        {
            id: 'meditate',
            title: 'Meditate',
            subtitle: 'Theta Meditation',
            icon: Flower2,
            color: 'from-purple-500/20 to-pink-500/20',
            iconColor: 'text-purple-300'
        },
        {
            id: 'relax',
            title: 'Relax',
            subtitle: 'Calm Alpha Flow',
            icon: Waves,
            color: 'from-teal-500/20 to-emerald-500/20',
            iconColor: 'text-teal-300'
        }
    ];

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <header className="flex justify-between items-center py-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-lg">👤</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Good morning, Alex</h1>
                </div>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Settings className="text-white" size={24} />
                </button>
            </header>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            className={`glass-card p-5 rounded-3xl text-left transition-all duration-300 hover:scale-[1.02] group`}
                        >
                            <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 ${cat.iconColor}`}>
                                <Icon size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{cat.title}</h3>
                            <p className="text-white/50 text-sm">{cat.subtitle}</p>
                        </button>
                    );
                })}
            </div>

            <div className="flex-1" />

            {/* Player Bar */}
            <PlayerBar />
        </div>
    );
};
