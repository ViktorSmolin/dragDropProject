import React, { Component, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';
import { ErrorHandler, ErrorType } from '../../Util/ErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    ErrorHandler.createError(
      ErrorType.UNKNOWN_ERROR,
      `React Error Boundary: ${error.message}`,
      {
        error: error.toString(),
        errorInfo,
        stack: error.stack
      },
      'render',
      false
    );
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.error_boundary}>
          <div className={styles.error_content}>
            <div className={styles.error_icon}>💥</div>
            <h2 className={styles.error_title}>Что-то пошло не так</h2>
            <p className={styles.error_message}>
              Произошла непредвиденная ошибка в приложении
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className={styles.error_details}>
                <summary>Подробности ошибки (режим разработки)</summary>
                <pre className={styles.error_stack}>
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className={styles.error_actions}>
              <button 
                onClick={this.handleRetry}
                className={styles.retry_button}
              >
                🔄 Попробовать снова
              </button>
              <button 
                onClick={() => window.location.reload()}
                className={styles.reload_button}
              >
                🔃 Перезагрузить страницу
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;