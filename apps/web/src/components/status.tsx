import type { ReactNode } from 'react';

export function LoadingCards({ count, label }: { count: number; label: string }) {
  return (
    <div className="card-grid" aria-busy="true" aria-label={label} role="status">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="state state--empty">{children}</div>;
}
