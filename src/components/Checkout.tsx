import React, { useState } from 'react';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { Lock, CreditCard } from 'lucide-react';

const CheckoutForm: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({ onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In a real app, you would create a PaymentIntent on the server
        // and confirm it here. For demo purposes, we'll just simulate success.
        setProcessing(false);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#ffffff',
                                '::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.3)',
                                },
                            },
                            invalid: {
                                color: '#ef4444',
                            },
                        },
                    }}
                />
            </div>



            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="flex-1 py-3 rounded-xl bg-accent-gold text-black font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            <Lock size={16} /> Pay Now
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export const Checkout: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0f1021] rounded-[2rem] overflow-hidden shadow-2xl animate-float p-6">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-accent-gold/20 flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="text-accent-gold" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Secure Checkout</h2>
                    <p className="text-white/50 text-sm">Complete your subscription upgrade</p>
                </div>

                <Elements stripe={stripePromise}>
                    <CheckoutForm
                        onSuccess={() => {
                            alert('Payment Successful! Welcome to Premium.');
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                </Elements>
            </div>
        </div>
    );
};
