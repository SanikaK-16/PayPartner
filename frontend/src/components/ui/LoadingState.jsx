function LoadingState({ message = "Loading..." }) {
  return (
    <div
      className="flex min-h-40 w-full items-center justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-5 py-4 text-sm text-text-secondary shadow-sm">
        <div
          className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-border border-t-primary"
          aria-hidden="true"
        />
        <span>{message}</span>
      </div>
    </div>
  );
}

export default LoadingState;