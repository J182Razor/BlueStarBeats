// This is a simplified auth setup for the frontend demo.
// In a real app, this would interface with a backend running Auth.js

export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
}

// Mock auth state management
class AuthService {
    private user: User | null = null;
    private listeners: ((user: User | null) => void)[] = [];

    constructor() {
        // Check local storage for persisted session
        const stored = localStorage.getItem('bsb_user');
        if (stored) {
            this.user = JSON.parse(stored);
        }
    }

    signIn(email: string) {
        // Mock sign in
        this.user = {
            id: '1',
            name: 'Alex Rivera',
            email: email,
            image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
        };
        localStorage.setItem('bsb_user', JSON.stringify(this.user));
        this.notify();
        return Promise.resolve(this.user);
    }

    signOut() {
        this.user = null;
        localStorage.removeItem('bsb_user');
        this.notify();
        return Promise.resolve();
    }

    getUser() {
        return this.user;
    }

    subscribe(callback: (user: User | null) => void) {
        this.listeners.push(callback);
        callback(this.user);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notify() {
        this.listeners.forEach(l => l(this.user));
    }
}

export const auth = new AuthService();
