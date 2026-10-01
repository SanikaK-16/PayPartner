function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none";

  const variants = {
    primary:
      "bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",

    secondary:
      "border border-border bg-white text-navy shadow-sm hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm active:bg-primary/10",

    danger:
      "bg-error text-white shadow-sm hover:bg-error/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;