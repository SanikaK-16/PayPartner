function Input({
  label,
  type = "text",
  placeholder = "",
  error = "",
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-text">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/10 ${
          error ? "border-error" : "border-border"
        } ${className}`}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;