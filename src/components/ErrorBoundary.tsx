import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/monitoring';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Shown in the fallback heading so the user knows where the failure happened. */
  title?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time exceptions so a single broken component degrades into a
 * visible fallback instead of a blank screen. Every caught error is reported
 * through the central logError funnel (console + in-memory buffer + optional
 * Firebase Analytics exception event).
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError(error, {
      source: 'react-render',
      componentStack: info.componentStack?.trim() || 'unknown',
    });
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, title = 'Algo salió mal' } = this.props;

    if (!error) return children;

    return (
      <div
        role='alert'
        className='flex items-center justify-center min-h-[60vh] p-4'
      >
        <div className='w-full max-w-lg rounded-lg border bg-card p-6 space-y-4 shadow-sm'>
          <h2 className='text-lg font-semibold tracking-tight'>{title}</h2>
          <p className='text-sm text-muted-foreground'>
            La aplicación encontró un error inesperado y detuvo esta vista
            para evitar un fallo mayor. El detalle quedó registrado en la
            consola.
          </p>
          <p className='text-sm p-3 rounded-md bg-muted font-mono break-words'>
            {error.message || 'Error sin mensaje'}
          </p>
          <div className='flex gap-2 justify-end'>
            <Button variant='outline' onClick={this.handleRetry}>
              Reintentar
            </Button>
            <Button onClick={this.handleReload}>Recargar página</Button>
          </div>
        </div>
      </div>
    );
  }
}
