import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { ProgressDashboard } from './components/ProgressDashboard';
import { LoyaltyLounge } from './components/LoyaltyLounge';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SessionFeedbackModal } from './components/SessionFeedbackModal';
import { Login } from './components/Login';
import { Checkout } from './components/Checkout';
import { auth, User } from './lib/auth';
import { LogOut, Crown } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'library' | 'profile'>('home');
  const [showSubscription, setShowSubscription] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return auth.subscribe((u) => setUser(u));
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'explore':
        return <ProgressDashboard />;
      case 'library':
        return <LoyaltyLounge />;
      case 'profile':
        if (!user) {
          return <Login />;
        }
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 p-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-[2px]">
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full rounded-full object-cover border-4 border-black"
              />
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-white/50">{user.email}</p>
            </div>

            <div className="w-full max-w-xs space-y-4">
              <button
                onClick={() => setShowSubscription(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2"
              >
                <Crown size={20} /> Upgrade to Premium
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        );
      default:
        return <Home />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}

      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        onUpgrade={() => {
          setShowSubscription(false);
          setShowCheckout(true);
        }}
      />

      <Checkout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />

      <SessionFeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </Layout>
  );
}

export default App;
