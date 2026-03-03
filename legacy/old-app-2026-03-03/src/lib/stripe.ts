import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_1234567890';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
