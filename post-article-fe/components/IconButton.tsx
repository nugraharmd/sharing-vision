import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  label: string;
  variant?: "default" | "danger" | "success";
  children: ReactNode;
}

export function IconButton({
  title,
  label,
  variant = "default",
  children,
  className = "",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={label}
      className={`icon-btn icon-btn--${variant} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
