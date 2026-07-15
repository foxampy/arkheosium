import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** When this value changes (e.g. the current route), a caught error is cleared. */
  resetKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    // Recover automatically when the user navigates to a different route
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#000c20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(0,230,200,0.08)',
                border: '1px solid rgba(0,230,200,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: 28,
              }}
            >
              &#9888;
            </div>
            <h1
              style={{
                color: '#ffffff',
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              Что-то пошло не так
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              Произошла непредвиденная ошибка. Попробуйте вернуться на главную
              или перезагрузить приложение.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '12px 28px',
                  borderRadius: 14,
                  background: 'rgba(0,230,200,0.15)',
                  color: '#00e6c8',
                  border: '1px solid rgba(0,230,200,0.3)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                На главную
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 28px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Перезагрузить
              </button>
            </div>

            {this.state.error && (
              <p
                style={{
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: 11,
                  marginTop: 32,
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
