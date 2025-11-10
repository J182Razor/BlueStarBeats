import React from 'react';
import { premiumService } from '../lib/premiumService';

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: (tier: 'monthly' | 'annual' | 'lifetime') => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUpgrade }) => {
  const pricing = premiumService.getPricingInfo();

  const features = [
    'Unlock all 50+ sessions',
    'All session lengths (5min to 2 hours)',
    'Advanced protocols (Gamma, custom frequencies)',
    'Mix BWE with your own music',
    'Offline mode',
    'Priority support'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card-premium max-w-2xl w-full p-8 relative">
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
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Upgrade to Premium</h2>
          <p className="text-gray-400">Unlock the full power of brainwave entrainment</p>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Premium Features</h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-brand-golden" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Monthly */}
          <div className="card-premium p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Monthly</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-brand-golden">${pricing.monthly.price}</span>
              <span className="text-gray-400">/{pricing.monthly.period}</span>
            </div>
            <button
              onClick={() => onUpgrade('monthly')}
              className="btn-secondary w-full"
            >
              Subscribe
            </button>
          </div>

          {/* Annual - Recommended */}
          <div className="card-highlight p-6 text-center relative">
            <span className="absolute top-2 right-2 px-2 py-1 bg-brand-golden text-black text-xs font-bold rounded">
              BEST VALUE
            </span>
            <h3 className="text-xl font-bold text-white mb-2">Annual</h3>
            <div className="mb-2">
              <span className="text-3xl font-bold text-brand-golden">${pricing.annual.price}</span>
              <span className="text-gray-400">/{pricing.annual.period}</span>
            </div>
            <div className="text-sm text-green-400 mb-4">
              Save {pricing.annual.savings} • ${(pricing.annual.price / 12).toFixed(2)}/mo
            </div>
            <button
              onClick={() => onUpgrade('annual')}
              className="btn-primary w-full"
            >
              Subscribe
            </button>
          </div>

          {/* Lifetime */}
          <div className="card-premium p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Lifetime</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-brand-golden">${pricing.lifetime.price}</span>
              <span className="text-gray-400">/{pricing.lifetime.period}</span>
            </div>
            <button
              onClick={() => onUpgrade('lifetime')}
              className="btn-primary w-full"
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* 7-Day Free Trial Note */}
        <div className="text-center text-sm text-gray-400">
          <p>Annual plan includes 7-day free trial. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;

