import React from 'react';
import { ArrowLeft, FileText, Activity, Moon, Zap } from 'lucide-react';

export const ProgressDashboard: React.FC = () => {
    const recentActivity = [
        {
            id: 1,
            title: 'Alpha Waves for Creativity',
            subtitle: 'Deep Focus • 30 min • 2 days ago',
            icon: Activity,
            color: 'bg-purple-500/20 text-purple-300'
        },
        {
            id: 2,
            title: 'Theta for Deep Meditation',
            subtitle: 'Meditation • 45 min • Yesterday',
            icon: Zap,
            color: 'bg-indigo-500/20 text-indigo-300'
        },
        {
            id: 3,
            title: 'Binaural Beats for Sleep',
            subtitle: 'Sleep • 60 min • 4 days ago',
            icon: Moon,
            color: 'bg-blue-500/20 text-blue-300'
        }
    ];

    return (
        <div className="flex flex-col min-h-full pb-8">
            {/* Header */}
            <header className="flex items-center gap-4 py-6 mb-6">
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="text-white" size={24} />
                </button>
                <h1 className="text-xl font-bold text-white flex-1 text-center pr-10">Progress Dashboard</h1>
            </header>

            {/* Circular Progress Section */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Streak Card */}
                <div className="glass-card rounded-3xl p-4 flex flex-col items-center justify-center aspect-square relative overflow-hidden">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Background Circle */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-white/10"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={351.86}
                                strokeDashoffset={351.86 * (1 - 5 / 7)}
                                strokeLinecap="round"
                                className="text-accent-purple"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white">5/7</span>
                            <span className="text-xs text-white/50">Days</span>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-white mt-2">Current Streak</span>
                </div>

                {/* Time Card */}
                <div className="glass-card rounded-3xl p-4 flex flex-col items-center justify-center aspect-square relative overflow-hidden">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-white/10"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={351.86}
                                strokeDashoffset={351.86 * (1 - 0.6)}
                                strokeLinecap="round"
                                className="text-accent-cyan"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white">12h</span>
                            <span className="text-xs text-white/50">30m</span>
                        </div>
                    </div>
                    <span className="text-sm font-medium text-white mt-2">Time Meditated</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass-card rounded-2xl p-5">
                    <p className="text-white/50 text-sm mb-1">Total Sessions</p>
                    <p className="text-3xl font-bold text-white">42</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                    <p className="text-white/50 text-sm mb-1">Favorite</p>
                    <p className="text-2xl font-bold text-white">Focus</p>
                </div>
            </div>

            {/* Recent Activity */}
            <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
            <div className="flex flex-col gap-3">
                {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                        <div key={activity.id} className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activity.color}`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate">{activity.title}</h4>
                                <p className="text-white/50 text-xs">{activity.subtitle}</p>
                            </div>
                            <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-2 transition-colors">
                                <FileText size={14} className="text-white/70" />
                                <span className="text-xs text-white/70">Notes</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
