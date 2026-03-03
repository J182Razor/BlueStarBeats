import React from 'react';
import { X, Waves, Crown, Download, Activity } from 'lucide-react';
import { clsx } from 'clsx';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) return null;

    const features = [
        { icon: Waves, text: 'Unlimited access to all brainwave sessions' },
        { icon: Crown, text: 'Exclusive guided meditations & courses' },
        { icon: Download, text: 'Offline mode for mindful journeys' },
        { icon: Activity, text: 'Advanced session tracking & insights' },
    ];

    const plans = [
        { id: 'monthly', name: 'MONTHLY', price: '$12.99', period: 'per month', popular: false },
        { id: 'annual', name: 'ANNUAL', price: '$69.99', period: 'Save 55%', popular: true },
        { id: 'lifetime', name: 'LIFETIME', price: '$199.99', period: 'one-time', popular: false },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0f1021] rounded-[2rem] overflow-hidden shadow-2xl animate-float">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-space-animated opacity-50" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-purple-500/20 to-transparent blur-3xl" />

                <div className="relative p-6 pt-12">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="text-white" size={20} />
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Unlock Your Full<br />Potential</h2>
                        <p className="text-white/60 text-sm">
                            Experience unlimited access to our entire<br />library of transformative soundscapes.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <Icon className="text-accent-purple" size={20} />
                                    </div>
                                    <p className="text-white/80 text-sm">{feature.text}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={clsx(
                                    "relative rounded-2xl p-3 text-center border transition-all duration-300 cursor-pointer",
                                    plan.popular
                                        ? "bg-accent-purple/20 border-accent-purple shadow-[0_0_20px_rgba(179,136,255,0.3)] scale-110 z-10"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-purple text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                                        MOST POPULAR
                                    </div>
                                )}
                                <p className="text-[10px] font-bold text-white/60 mb-1">{plan.name}</p>
                                <p className="text-lg font-bold text-white mb-1">{plan.price}</p>
                                <p className="text-[10px] text-white/40">{plan.period}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={onUpgrade}
                        className="w-full py-4 rounded-full bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-black font-bold text-lg shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-shadow mb-4"
                    >
                        Upgrade Now
                    </button>

                    <p className="text-center text-[10px] text-white/40">
                        Your free 7-day trial begins upon confirmation. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
};
