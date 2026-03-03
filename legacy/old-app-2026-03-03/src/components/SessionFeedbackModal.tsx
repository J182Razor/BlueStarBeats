import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { clsx } from 'clsx';

interface SessionFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SessionFeedbackModal: React.FC<SessionFeedbackModalProps> = ({ isOpen, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-sm glass-panel rounded-[2rem] overflow-hidden p-6 animate-float">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white text-center mb-8 mt-2">How was your session?</h2>

                {/* Stars */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                            className="p-2 transition-transform hover:scale-110"
                        >
                            <Star
                                size={32}
                                className={clsx(
                                    "transition-colors duration-200",
                                    (hoveredRating || rating) >= star
                                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                        : "fill-white/10 text-white/30"
                                )}
                            />
                        </button>
                    ))}
                </div>

                {/* Text Area */}
                <div className="relative mb-6">
                    <textarea
                        placeholder="Add a reflection..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:border-accent-purple/50 focus:bg-white/10 transition-all"
                    />
                </div>

                {/* Submit Button */}
                <button className="w-full py-3.5 rounded-full bg-accent-purple text-white font-semibold shadow-[0_0_20px_rgba(179,136,255,0.4)] hover:shadow-[0_0_30px_rgba(179,136,255,0.6)] transition-all mb-4">
                    Submit Feedback
                </button>

                <button
                    onClick={onClose}
                    className="w-full text-center text-white/50 text-sm hover:text-white transition-colors"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
};
