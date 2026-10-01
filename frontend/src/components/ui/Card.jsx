function Card({
  children,
  className = "",
  padding = true,
  interactive = false,
  onClick,
}) {
  const interactiveStyles = interactive
    ? [
        "cursor-pointer",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5",
        "hover:border-primary/40",
        "hover:bg-primary/[0.03]",
        "hover:shadow-md",
        "active:translate-y-0",
        "active:shadow-sm",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-primary/30",
        "focus:ring-offset-1",
      ].join(" ")
    : "";

  return (
    <div
      className={`rounded-xl border border-border bg-white shadow-sm ${
        padding ? "p-6" : ""
      } ${interactiveStyles} ${className}`}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive && onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

export default Card;