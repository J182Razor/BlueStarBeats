import React from 'react';
import { Home, Compass, Library, User } from 'lucide-react';
import { clsx } from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'explore' | 'library' | 'profile';
  onTabChange?: (tab: 'home' | 'explore' | 'library' | 'profile') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab = 'home', onTabChange }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background */}
      <div className="bg-space-animated" />
      <div className="stars" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 safe-area-inset">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 pb-safe pt-2 px-6 z-50">
        <div className="flex justify-between items-center max-w-md mx-auto h-16">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={clsx(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-white scale-110" : "text-white/50 hover:text-white/80"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-accent-purple mt-1 shadow-[0_0_8px_rgba(179,136,255,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
