import { Component } from 'react';

interface Props {
  children: React.ReactNode;
  onError: () => void;
}

interface State {
  hasError: boolean;
}

export class PaywallErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[PaywallErrorBoundary]', error);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
