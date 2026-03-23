import { Component } from 'react';

/** Catches render errors and shows a fallback so the app never goes blank. */
export default class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
                    <p className="text-sm text-slate-400">
                        {this.state.error?.message || 'An error occurred loading this page.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="btn-primary"
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
