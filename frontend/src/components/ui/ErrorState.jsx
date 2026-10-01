function ErrorState({
  message = "Something went wrong. Please try again.",
}) {
  return (
    <div
      className="flex min-h-40 w-full items-center justify-center px-4"
      role="alert"
    >
      <div className="flex w-full max-w-lg items-start gap-3 rounded-xl border border-error/20 bg-error/5 px-5 py-4 shadow-sm">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error/10 text-sm font-semibold text-error"
          aria-hidden="true"
        >
          !
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">
            Unable to load this section
          </p>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ErrorState;