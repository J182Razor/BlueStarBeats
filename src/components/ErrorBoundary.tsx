import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to monitoring service if available (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const eventId = (window as any).Sentry.captureException(error, {
        contexts: { react: errorInfo }
      });
      this.setState({ eventId });
    }
  }

  public render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-0 shadow-2xl max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h2>
            
            <p className="text-white/80 mb-6">
              {this.state.eventId 
                ? `We've been notified (Error ID: ${this.state.eventId}) and are working to fix the issue.`
                : 'An unexpected error occurred while running the audio application. Please refresh the page to try again.'}
            </p>
            
            {(this.state.error || this.state.errorInfo) && isDevelopment && (
              <details className="text-left mb-6">
                <summary className="text-white/60 text-sm cursor-pointer hover:text-white/80">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-300 mt-2 p-3 bg-black/30 rounded-2xl border-0 overflow-auto max-h-64">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-full border-0 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

