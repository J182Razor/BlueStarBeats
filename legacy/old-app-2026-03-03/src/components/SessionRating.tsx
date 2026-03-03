import React, { useState } from 'react';
import { HapticFeedbackService } from '../lib/hapticFeedbackService';
import { ImpactStyle } from '@capacitor/haptics';

interface SessionRatingProps {
  sessionId: string;
  sessionName: string;
  onRate: (rating: number, notes?: string) => void;
  onClose: () => void;
  initialRating?: number;
  initialNotes?: string;
}

const SessionRating: React.FC<SessionRatingProps> = ({
  sessionId: _sessionId,
  sessionName,
  onRate,
  onClose,
  initialRating,
  initialNotes
}) => {
  const [rating, setRating] = useState<number>(initialRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>(initialNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (value: number) => {
    HapticFeedbackService.impact(ImpactStyle.Light);
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    HapticFeedbackService.impact(ImpactStyle.Medium);
    
    try {
      await onRate(rating, notes.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to save rating:', error);
      alert('Failed to save rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-elevated max-w-md w-full p-6 sm:p-8 rounded-2xl relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Rate Your Session</h2>
        <p className="text-gray-400 mb-6">{sessionName}</p>

        {/* Star Rating */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            How effective was this session?
          </label>
          <div className="flex items-center gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-125"
                aria-label={`Rate ${value} out of 5`}
              >
                <svg
                  className={`w-10 h-10 transition-colors ${
                    value <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600 fill-gray-600'
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center mt-2 text-sm text-gray-400">
              {ratingLabels[rating]}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did this session make you feel? Any observations?"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {notes.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionRating;

