import React, { useState } from 'react';
import { premiumService } from '../lib/premiumService';

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: (tier: 'monthly' | 'annual' | 'lifetime') => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUpgrade }) => {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const pricing = premiumService.getPricingInfo();

  const features = [
    { icon: '🎵', text: 'Unlock all 50+ sessions' },
    { icon: '⏱️', text: 'All session lengths (5min to 2 hours)' },
    { icon: '🧠', text: 'Advanced protocols (Gamma, custom frequencies)' },
    { icon: '🎧', text: 'Mix BWE with your own music' },
    { icon: '📱', text: 'Offline mode' },
    { icon: '💬', text: 'Priority support' }
  ];

  const tiers = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: pricing.monthly.price,
      period: pricing.monthly.period,
      buttonText: 'Subscribe',
      gradient: 'from-gray-600 to-gray-700',
      popular: false
    },
    {
      id: 'annual',
      name: 'Annual',
      price: pricing.annual.price,
      period: pricing.annual.period,
      savings: pricing.annual.savings,
      monthlyPrice: (pricing.annual.price / 12).toFixed(2),
      buttonText: 'Subscribe',
      gradient: 'from-purple-600 to-blue-600',
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: pricing.lifetime.price,
      period: pricing.lifetime.period,
      buttonText: 'Buy Now',
      gradient: 'from-yellow-500 to-orange-600',
      popular: false
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="glass-elevated max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 relative animate-scale-in"
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
          "
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header - Premium Design */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-6 shadow-2xl shadow-purple-500/50">
            <span className="text-4xl">⭐</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-gradient">Upgrade to Premium</span>
          </h2>
          <p className="text-gray-300 text-lg">Unlock the full power of brainwave entrainment</p>
        </div>

        {/* Features - Enhanced Design */}
        <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
            Premium Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="
                  flex items-center gap-4
                  p-4 rounded-xl
                  bg-gray-800/30 border border-gray-700/50
                  hover:border-purple-500/30
                  transition-all duration-300
                  hover:scale-[1.02]
                  animate-fade-in
                "
                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
              >
                <div className="text-2xl">{feature.icon}</div>
                <span className="text-gray-300 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Options - Premium Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tiers.map((tier, index) => {
            const isHovered = hoveredTier === tier.id;
            const isPopular = tier.popular;
            
            return (
              <div
                key={tier.id}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
                className={`
                  relative
                  p-6 rounded-2xl
                  border-2 transition-all duration-500
                  overflow-hidden
                  animate-scale-in
                  ${isPopular
                    ? `bg-gradient-to-br ${tier.gradient} border-transparent shadow-2xl scale-105`
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                  }
                  ${isHovered && !isPopular ? 'scale-[1.02]' : ''}
                `}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="
                      px-3 py-1
                      bg-white text-purple-600
                      text-xs font-bold
                      rounded-full
                      shadow-lg
                      animate-pulse
                    ">
                      BEST VALUE
                    </span>
                  </div>
                )}
                
                {/* Shine effect */}
                <div className="
                  absolute inset-0
                  bg-gradient-to-r from-transparent via-white/10 to-transparent
                  -translate-x-full group-hover:translate-x-full
                  transition-transform duration-1000
                " />
                
                <div className="relative z-10 text-center">
                  <h3 className={`
                    text-2xl font-bold mb-4
                    ${isPopular ? 'text-white' : 'text-white'}
                  `}>
                    {tier.name}
                  </h3>
                  
            <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className={`
                        text-4xl font-extrabold
                        ${isPopular ? 'text-white' : 'text-gradient-gold'}
                      `}>
                        ${tier.price}
                      </span>
                      <span className="text-gray-400 text-sm">/{tier.period}</span>
          </div>

                    {tier.savings && (
                      <div className="mt-2 text-sm text-green-300 font-semibold">
                        Save {tier.savings} • ${tier.monthlyPrice}/mo
            </div>
                    )}
            </div>
                  
            <button
                    onClick={() => onUpgrade(tier.id as 'monthly' | 'annual' | 'lifetime')}
                    className={`
                      w-full py-3 px-6 rounded-full
                      font-semibold text-white
                      transition-all duration-300
                      transform hover:scale-105
                      ${isPopular
                        ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30'
                        : `bg-gradient-to-r ${tier.gradient} shadow-lg hover:shadow-xl`
                      }
                    `}
                  >
                    {tier.buttonText}
            </button>
          </div>

                {/* Bottom accent line */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1
                  bg-gradient-to-r ${tier.gradient}
                  transform ${isPopular ? 'scale-x-100' : 'scale-x-0'}
                  transition-transform duration-500 origin-left
                `} />
              </div>
            );
          })}
            </div>

        {/* Free Trial Note - Enhanced */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900/30 border border-blue-700/30 rounded-full">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <p className="text-sm text-blue-200">
              Annual plan includes 7-day free trial. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
