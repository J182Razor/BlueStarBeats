import React from 'react';
import { Settings, Moon, Brain, Lightbulb, Leaf, ArrowLeft } from 'lucide-react';

export const LoyaltyLounge: React.FC = () => {
    const presets = [
        {
            id: 1,
            title: 'Deep Sleep',
            subtitle: '1.5Hz',
            icon: Moon,
            color: 'text-purple-300'
        },
        {
            id: 2,
            title: 'Focus Flow',
            subtitle: '14Hz',
            icon: Brain,
            color: 'text-blue-300'
        },
        {
            id: 3,
            title: 'Creative Boost',
            subtitle: '8Hz',
            icon: Lightbulb,
            color: 'text-yellow-300'
        },
        {
            id: 4,
            title: 'Mindful Calm',
            subtitle: '4Hz',
            icon: Leaf,
            color: 'text-green-300'
        }
    ];

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <header className="flex justify-between items-center py-6 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Loyalty Lounge</h1>
                </div>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Settings className="text-white" size={24} />
                </button>
            </header>

            {/* Gold Card */}
            <div className="relative w-full aspect-[1.6] rounded-3xl overflow-hidden mb-8 group transition-transform hover:scale-[1.02] duration-500">
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600" />

                {/* Texture/Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="flex justify-end">
                        {/* Chip or Logo could go here */}
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Alex Rivera</h3>
                        <p className="text-white/80 font-medium mb-4">Gamma Tier</p>

                        <div className="flex items-end justify-between">
                            <p className="text-white/70 text-sm max-w-[60%]">
                                Unlock exclusive access to Gamma wave frequencies.
                            </p>
                            <button className="px-6 py-2 bg-accent-purple text-white font-semibold rounded-full shadow-lg hover:bg-accent-purple/90 transition-colors">
                                Unlock ...
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audio Presets */}
            <h2 className="text-lg font-bold text-white mb-4">Your Audio Presets</h2>
            <div className="grid grid-cols-2 gap-4">
                {presets.map((preset) => {
                    const Icon = preset.icon;
                    return (
                        <button
                            key={preset.id}
                            className="glass-card p-5 rounded-3xl text-left transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
                        >
                            <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 ${preset.color}`}>
                                <Icon size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{preset.title}</h3>
                            <p className="text-white/50 text-sm">{preset.subtitle}</p>
                        </button>
                    );
                })}
            </div>

            {/* Settings Section at Bottom */}
            <div className="mt-8 mb-4">
                <button className="w-full glass-panel p-4 rounded-2xl flex justify-between items-center text-white hover:bg-white/5 transition-colors">
                    <span className="font-medium">Settings</span>
                    <ArrowLeft className="rotate-[-90deg] text-white/50" size={20} />
                </button>
            </div>
        </div>
    );
};
