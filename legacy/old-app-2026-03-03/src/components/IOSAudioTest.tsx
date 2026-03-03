import React, { useState, useEffect } from 'react';
import { IOSAudioManager } from '../lib/iosAudioManager';

const IOSAudioTest: React.FC = () => {
  const [audioStatus, setAudioStatus] = useState<'unknown' | 'configured' | 'failed'>('unknown');
  const [contextState, setContextState] = useState<string>('unknown');

  useEffect(() => {
    const checkAudioStatus = async () => {
      try {
        const manager = IOSAudioManager.getInstance();
        await manager.initializeIOSAudio();
        setAudioStatus('configured');
        
        const context = manager.getAudioContext();
        if (context) {
          setContextState(context.state);
          
          // Listen for state changes
          const stateChangeListener = () => {
            setContextState(context.state);
          };
          
          context.addEventListener('statechange', stateChangeListener);
          
          return () => {
            context.removeEventListener('statechange', stateChangeListener);
          };
        }
      } catch (error) {
        console.error('Audio test failed:', error);
        setAudioStatus('failed');
      }
    };

    if (typeof window !== 'undefined') {
      checkAudioStatus();
    }
  }, []);

  return (
    <div className="audio-test-panel glass-card-silver p-6 rounded-xl">
      <h3 className="text-xl font-bold text-silver-light mb-4">iOS Audio Test</h3>
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-semibold">Status:</span>{' '}
          <span className={audioStatus === 'configured' ? 'text-green-400' : audioStatus === 'failed' ? 'text-red-400' : 'text-yellow-400'}>
            {audioStatus}
          </span>
        </p>
        <p className="text-sm">
          <span className="font-semibold">Context State:</span>{' '}
          <span className="text-silver-dark">{contextState}</span>
        </p>
        {audioStatus === 'failed' && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry Audio Setup
          </button>
        )}
      </div>
    </div>
  );
};

export default IOSAudioTest;

