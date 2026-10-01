function EmptyState({
  title = "No data available",
  message = "There is nothing to display here yet.",
}) {
  return (
    <div className="flex min-h-40 w-full items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-white px-6 py-7 text-center shadow-sm">
        <div
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
          aria-hidden="true"
        >
          —
        </div>

        <p className="mt-3 text-sm font-semibold text-text">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {message}
        </p>
      </div>
    </div>
  );
}

export default EmptyState;