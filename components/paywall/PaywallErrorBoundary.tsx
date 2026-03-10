import { Component } from 'react';
import { logger } from '@/lib/logger';

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
    logger.error('PaywallErrorBoundary', error);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
