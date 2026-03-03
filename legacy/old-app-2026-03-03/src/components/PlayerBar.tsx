import React from 'react';
import { Play } from 'lucide-react';

export const PlayerBar: React.FC = () => {
    return (
        <div className="glass-panel rounded-3xl p-4 flex items-center gap-4 mb-20 mx-2">
            <div className="w-12 h-12 rounded-xl bg-cover bg-center shadow-lg"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=200)' }} />

            <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold truncate">Deep Delta Waves</h4>
                <p className="text-white/50 text-xs">Sleep Session</p>
            </div>

            <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center text-white shadow-[0_0_15px_rgba(179,136,255,0.5)] hover:scale-105 transition-transform">
                    <Play size={20} fill="currentColor" className="ml-1" />
                </button>
            </div>
        </div>
    );
};
